# GearUp — Frontend

**Rent sports & outdoor gear instantly.**

A Next.js 16 App Router frontend for a gear rental marketplace, with three
roles — customers who book gear, providers who list it, and admins who moderate
the platform. Real Stripe Checkout, JWT auth with silent refresh, and
role-protected dashboards.

## Live

|             |                                         |
| ----------- | --------------------------------------- |
| Frontend    | https://gear-up-frontend-chi.vercel.app |
| Backend API | https://gear-up-backend-two.vercel.app  |

### Demo accounts

The login page has a **Try a demo account** row — one click fills the form for
any of these. Password is `Password123` for all three.

| Role     | Email                  |
| -------- | ---------------------- |
| Customer | `customer1@gearup.com` |
| Provider | `provider2@gearup.com` |
| Admin    | `admin@gearup.com`     |

---

## What it does

### Public

- Home page in eight sections — category grid, featured gear, how it works, a
  review slider, an FAQ accordion and a newsletter sign-up
- Responsive gear grid with `next/image`, price per day, category and
  availability, each card ending in a **View details** button — the only
  clickable target on the card
- Filter by search term, category, brand, price range and availability —
  **all held in the URL**, so every filtered view is shareable and
  server-rendered
- Gear detail page with image gallery, specifications, provider info, average
  rating, paginated reviews, and a **More in {category}** row of related gear
  that lists rentable items first and disappears entirely when there is nothing
  to relate to
- Date-picker booking that blocks past dates and caps quantity at available
  stock

### Customer

- Register / log in with inline Zod validation
- Book gear, then pay through **Stripe Checkout** with dedicated success and
  cancel pages
- Track rentals with status badges, cancel while still `PLACED`
- Payment history and per-payment receipts
- Leave a review once a rental is `RETURNED`

### Provider

- Overview of listings, orders and what needs action
- Full gear CRUD — create, edit, delete, with a cover image plus a gallery
- Availability toggle with optimistic update and rollback
- Order queue with the status chain: **Confirm order → Mark picked up → Mark
  returned**

### Admin

- Platform totals for users, listings and rentals, plus two live bar charts —
  orders by status and listings by category — drawn from the same API the
  tables read, with a table view of the numbers under each one
- User table with role and status filters, and suspend / activate switches
- Every dashboard table across all three roles filters and paginates, with the
  filters held in the URL so a filtered view is shareable
- Read-only moderation views for every listing and every rental order
- Category CRUD, with a delete that refuses while listings still reference it

### Every role

- **Sign in with Google**, or with an email and password — both land in the same
  session.
- Profile page showing the account as the server sees it, with an edit form for
  name and phone. Email, role and status are deliberately not editable — the
  API validates the payload down to those two fields, so it can't be talked
  into more from the client.

---

## Tech

|                                                                         |                                                 |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| **Next.js 16.2** (App Router)                                           | Server Components, Route Handlers, `proxy.ts`   |
| **React 19.2** · **TypeScript**                                         |                                                 |
| **Tailwind CSS v4** · **Base UI**                                       | shadcn-style components in `components/ui`      |
| **TanStack Query v5**                                                   | Client cache for every dashboard table          |
| **React Hook Form + Zod v4**                                            | All form state and validation                   |
| **Recharts 3**                                                          | The two admin overview charts                   |
| **Stripe.js**                                                           | Checkout redirect flow                          |
| **Google OAuth 2.0 + PKCE**                                             | Hand-rolled in two route handlers — no NextAuth |
| `jsonwebtoken` · `next-themes` · `date-fns` · `sonner` · `lucide-react` |                                                 |

---

## Running locally

Requires **Node 20+** and the backend running (default `http://localhost:5000`).

```bash
git clone <this-repo>
cd gearUp-frontend
npm install
cp .env.example .env      # then fill in the values below
npm run dev               # http://localhost:3000
```

### Environment

```ini
BACKEND_API_URL=http://localhost:5000
JWT_ACCESS_SECRET=...      # must match the backend exactly
JWT_REFRESH_SECRET=...     # must match the backend exactly
GOOGLE_CLIENT_ID=...       # client ID only — the secret goes in the backend
# APP_URL=https://…        # optional, pins the OAuth redirect_uri
```

All of them are **server-only** — nothing is prefixed `NEXT_PUBLIC_`, so no
secret and no token ever reaches the browser. The JWT secrets are needed
because `proxy.ts` verifies tokens locally instead of calling the API on every
navigation.

### Setting up Google sign-in

In the Google Cloud Console → APIs & Services → Credentials → **Create OAuth
client ID** → _Web application_, add both redirect URIs (Google matches them
character for character):

```
http://localhost:3000/api/auth/google/callback
https://<your-frontend-domain>/api/auth/google/callback
```

Put `GOOGLE_CLIENT_ID` in the frontend's `.env`, and **both**
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the backend's. Without them the
button redirects straight back to `/login?error=google` rather than failing
mysteriously.

### Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run start       # serve the build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run format      # prettier
```

### Testing payments

Stripe redirects back to your machine, so the webhook needs forwarding:

```bash
stripe listen --forward-to localhost:5000/api/payments/confirm
```

Use card `4242 4242 4242 4242`, any future expiry and CVC. Orders have a **৳65
minimum** — Stripe rejects anything smaller.

---

## Architecture

### Data flow

Two owners, split by what the data is for:

|                                                              | Owner                                     |
| ------------------------------------------------------------ | ----------------------------------------- |
| SEO-relevant page data — home, browse, gear detail, reviews  | **Server Components** + Next's Data Cache |
| Dashboard tables — filtering, pagination, optimistic updates | **TanStack Query**                        |

Every table gets both: the server renders page one as `initialData` so there is
no loading flash, then TanStack Query owns refetching from there.

**The backend is only ever called from the server** — a Server Component, a
`"use server"` action, or a Route Handler. The access token lives in an
httpOnly cookie scoped to this origin, so a browser `fetch` could never carry
it to the API anyway. That's why `app/api/*` exists: thin read endpoints that
let client components query without the token leaving the server.

Full endpoint-to-component mapping is in
**[API_INTEGRATION.md](./API_INTEGRATION.md)**.

### Auth

`proxy.ts` (Next 16's renamed `middleware.ts`) guards every dashboard route:

1. Verify the access token
2. If it's expired but the refresh token is valid, mint a new one silently
3. Ask `/api/auth/me` for the user's **current** role and status

Step 3 matters because a token's claims are frozen at login. Without it, an
admin promoting someone wouldn't take effect for 24 hours, and a suspended user
would keep browsing their dashboard until their token expired. Suspension now
signs them out immediately; a role change re-mints their token instead of
bouncing them to `/not-found`.

**Google sign-in** is a real OAuth 2.0 authorization-code flow with PKCE, not a
button that fakes one. `/api/auth/google/start` mints the `state` and verifier;
`/api/auth/google/callback` checks `state` and hands the code to the backend,
which is the only side holding the client secret. The backend exchanges the code
and verifies the ID token's signature against Google's published keys before
believing a single claim in it, then returns the same token pair a password
login would — so the callback sets identical cookies and nothing downstream
knows the difference. Both routes are plain links and redirects: the flow works
with JavaScript disabled.

A first Google sign-in creates the account with the role chosen on `/register`;
signing in with an email that already has a password account **links** the two
rather than duplicating, which is safe only because Google's `email_verified`
claim is checked first. Those accounts keep their password. Accounts created
_through_ Google have none — `passwordHash` is genuinely null in the database —
so trying to log in with a password tells you to use Google instead of claiming
the password is wrong.

### Global state

| Provider          | Holds                                     |
| ----------------- | ----------------------------------------- |
| `QueryProvider`   | TanStack Query client                     |
| `SessionProvider` | The signed-in user, for client components |
| `ThemeProvider`   | Light / dark                              |
| `SidebarProvider` | Sidebar collapse state                    |

`SessionProvider` doesn't fetch anything — the dashboard layout already
verified the session server-side, so the value comes down as a prop. That keeps
the cookie on the server and means the context can never disagree with the
request that rendered the page.

### Error handling

`apiFetch` never throws. Failures — including network errors — come back as
`{ success: false, statusCode, message }`, so every caller handles them the
same way: a field error, a toast, or an inline panel. Opaque backend messages
are translated at the call site, so Prisma's `"Duplicate Key Error"` reaches
the user as _"A category with that name already exists."_

### Two forms that don't reach a database

**The contact form and the newsletter sign-up validate but don't persist.** The
API has no `ContactMessage` or `Subscriber` model, so both server actions
re-validate the payload with the same Zod schema the client used and return
success — nothing is stored and no email is sent. Everything else on the site
talks to the real API.

The contact page carries a real email address and phone number precisely
because of this, so there is always a route that genuinely reaches a person.

---

## Structure

```
app/
  (public)/        home, gear browse, gear detail
  (auth)/          login, register
  (dashboard)/     customer · provider · admin, plus shared _actions
  api/             read endpoints for TanStack Query
components/
  providers/       QueryProvider, SessionProvider
  shared/          cross-role components
  ui/              Base UI primitives
lib/
  api.ts           the single fetch helper
  queries/         TanStack Query hooks
  schemas/         Zod schemas
  *Query.ts        URL filter parsers
service/           auth calls used by proxy.ts
proxy.ts           route protection
```

---

## Deploying

Set the three environment variables in your host's dashboard, pointing
`BACKEND_API_URL` at the deployed API and matching the JWT secrets to it. The
build needs no other configuration:

```bash
npm run build
```

Then point the backend's `APP_URL` at the deployed frontend — it builds Stripe's
`success_url` and `cancel_url` from it, so a stale value sends paying customers
to the wrong origin.
