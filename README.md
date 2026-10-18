# GearUp

**Rent sports and outdoor gear in Bangladesh.** GearUp is a rental
marketplace: customers find tents, kayaks, bikes and cameras near them, book
dates and pay online, and local providers earn from gear they already own.

This repository is the website, built with Next.js 16 (App Router), React 19
and Tailwind CSS 4, in English and Bangla. The API lives in its own
repository,
[gearup-backend-api](https://github.com/abdullahmamun1/gearup-backend-api).

|              |                                                      |
| ------------ | ---------------------------------------------------- |
| Website      | https://gear-up-frontend-chi.vercel.app              |
| API          | https://gear-up-backend-two.vercel.app               |
| This repo    | https://github.com/abdullahmamun1/gearUp-frontend    |
| Backend repo | https://github.com/abdullahmamun1/gearup-backend-api |

## Table of contents

- [Demo accounts](#demo-accounts)
- [Problems it solves](#problems-it-solves)
  - [For renters](#for-renters)
  - [For gear owners](#for-gear-owners)
  - [Trust between strangers](#trust-between-strangers)
  - [Running the marketplace](#running-the-marketplace)
- [Features](#features)
  - [For everyone](#for-everyone)
  - [Customers](#customers)
  - [Providers](#providers)
  - [Admins](#admins)
  - [AI features](#ai-features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
  - [Requirements](#requirements)
  - [Install and run](#install-and-run)
  - [Environment variables](#environment-variables)
  - [Google sign-in](#google-sign-in)
  - [Payments](#payments)
  - [Scripts](#scripts)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
  - [Talking to the API](#talking-to-the-api)
  - [Sign-in and route protection](#sign-in-and-route-protection)
  - [Rendering and caching](#rendering-and-caching)
  - [Languages](#languages)
  - [Design system](#design-system)
  - [SEO and installable app](#seo-and-installable-app)
- [Checking your changes](#checking-your-changes)
- [Deploying to Vercel](#deploying-to-vercel)

## Demo accounts

The login page has a **Try a demo account** row that fills in the form for
you. The password for every account is `Password123`.

| Role     | Email                  |
| -------- | ---------------------- |
| Customer | `customer1@gearup.com` |
| Provider | `provider2@gearup.com` |
| Admin    | `admin@gearup.com`     |

## Problems it solves

### For renters

| Problem                                                                              | How GearUp solves it                                                                                        |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Good gear is expensive, and most people use a tent or kayak only a few times a year. | Rent it by the day from people nearby, starting from ৳65 an order.                                          |
| You can't tell whether gear is free on your dates until you message the owner.       | Pick dates and see only gear that is free on every day. The gear page shows availability day by day.        |
| Gear is listed far away or with vague locations.                                     | Filter by city or "near me" with a radius, or browse on a map. Results are sorted by distance.              |
| You don't know what to pack for a trip.                                              | The AI trip planner asks about the trip and suggests real gear that is available on your dates.             |
| A search like "camping stuff" returns a mess.                                        | AI search suggestions turn it into precise searches ("2-person tent in Sylhet").                            |
| Reading dozens of reviews takes too long.                                            | Each gear page summarises the reviews into a short verdict with pros and cons.                              |
| Arranging pickup over phone calls is messy.                                          | Every order has its own chat with the provider, a pickup map once paid and a reminder email the day before. |
| You're never sure what state a booking is in.                                        | A live order timeline, an email at every step and unread message badges.                                    |
| Many sites are English only.                                                         | The whole site, emails and AI replies work in Bangla, with Bengali digits.                                  |

### For gear owners

| Problem                                                       | How GearUp solves it                                                                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Expensive gear sits unused most of the year.                  | List it in a few minutes and earn per day. The home page calculator estimates earnings first.                                           |
| Writing a good listing and choosing a price is hard.          | The AI listing writer drafts the description and highlights and suggests a fair price for the category. Photos upload by drag and drop. |
| Double bookings when the same item is promised to two people. | Stock is counted per day across all bookings, and simultaneous bookings take turns, so an item can't be overbooked.                     |
| Gear comes back damaged.                                      | A security deposit is charged with the payment. On return the owner releases it or reports damage, and an admin settles the claim.      |
| Renters book and then disappear.                              | A booking only holds the gear until its deadline: the renter must pay within 24 hours of confirmation or it is cancelled and freed.     |
| No overview of how the gear is doing.                         | A dashboard with earnings per month, top gear, orders by status and a public profile with ratings.                                      |

### Trust between strangers

| Problem                                           | How GearUp solves it                                                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Paying a stranger up front is risky.              | Payment goes through Stripe, and only after the owner has confirmed the booking.                                          |
| Plans change.                                     | Free cancellation before payment, and a full automatic refund until 24 hours before the start day.                        |
| Owners don't reply, and renters wait for nothing. | Owners have 48 hours to respond, or the request is cancelled automatically. Response time shows on their profile.         |
| Fake reviews.                                     | Only a renter whose order was returned can review it, once per order. Admins can hide abusive reviews.                    |
| Sharing your home address with strangers.         | Before payment, renters see only an approximate area (about 1 km). The exact pickup point appears once the order is paid. |
| Fake or throwaway accounts.                       | Email verification is required before paying or publishing gear. Admins can suspend accounts.                             |

### Running the marketplace

| Problem                                     | How GearUp solves it                                                                                                                   |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Damage disputes between renters and owners. | A claims queue where an admin keeps all, part or none of the deposit. The refund goes back through Stripe.                             |
| Support messages pile up.                   | An admin inbox with read, archive and reply, plus AI-drafted answers based on the rental policy.                                       |
| No clear view of how the business is doing. | Analytics by date range (revenue, orders, top categories and providers, cities), AI insights that explain the changes and CSV exports. |
| Slow phones and patchy mobile data.         | Public pages are prerendered and load fast, the site installs like an app and shows an offline page when the connection drops.         |
| Being found on Google.                      | Every page has its own metadata in both languages, plus structured data, a sitemap and share images.                                   |

## Features

### For everyone

- **Home page** with a 3D hero (a flat illustration on phones), search by gear,
  dates and city, categories, featured gear, how it works, reviews, an
  earnings calculator for providers, FAQ and newsletter sign-up.
- **Browse gear** (`/gear`): search, category chips, brand, price, dates and
  availability filters, sorting, pagination, a list or map view, and "near me"
  search.
- **Gear page:** photo gallery, live availability calendar, price breakdown,
  deposit, AI review summary, reviews, the provider's area on a map and
  related gear.
- **Provider profiles** with their listings, rating, response time and reviews.
- **Help centre** with searchable answers, plus About, Contact and Privacy
  pages.
- **Search palette** (⌘K / Ctrl+K) for gear, categories, pages and actions.
- Light and dark themes, English and Bangla, and an installable app.

### Customers

- Book gear for a date range and pay with Stripe Checkout.
- Follow each order on a live timeline, chat with the provider, see the exact
  pickup point once paid, cancel and get refunds within the policy.
- Overview with spending and order charts, saved gear, payment history, reviews
  after a return and a profile with language and email settings.

### Providers

- List gear with drag-and-drop photo upload, pricing, stock and deposit.
- Accept or decline requests, then mark pickup and return. On return, release
  the deposit or report damage.
- Overview with earnings and top gear charts, an order page with chat, and a
  public profile with a map pin.

### Admins

- Manage users (role, suspend), categories, all gear (feature it on the home
  page) and all rentals.
- Hide or restore reviews, settle damage claims, answer contact messages from an
  inbox and see newsletter subscribers.
- Analytics by date range with charts, AI insights and CSV exports.

### AI features

| Feature            | Where                           | What it does                                                  |
| ------------------ | ------------------------------- | ------------------------------------------------------------- |
| Trip planner       | "Plan my trip" button, hero, ⌘K | Describe a trip and get real, available gear for your dates   |
| Search suggestions | Under the `/gear` filters       | "Try:" chips that turn a vague search into a precise one      |
| Listing writer     | Provider's gear form            | Drafts the description, highlights, category and a fair price |
| Review summaries   | Gear page                       | "What renters say" with pros and cons                         |
| Admin insights     | Admin analytics                 | Explains what changed in the numbers and why it matters       |
| Inbox drafts       | Admin inbox                     | Drafts a reply from the rental policy; an admin sends it      |

## Tech stack

| Area        | Technology                                                   |
| ----------- | ------------------------------------------------------------ |
| Framework   | Next.js 16.4 (App Router, Server Components, Server Actions) |
| UI          | React 19, Tailwind CSS 4, shadcn/ui on Base UI, lucide-react |
| Data        | TanStack Query 5, Next.js Data Cache                         |
| Forms       | react-hook-form, Zod 4                                       |
| Languages   | next-intl 4 (English and Bangla)                             |
| Motion      | motion, Embla Carousel, React View Transitions               |
| 3D and maps | React Three Fiber, Leaflet with OpenStreetMap                |
| Charts      | Recharts                                                     |
| Other       | cmdk, sonner, dnd-kit, Cloudinary uploads, Vercel Analytics  |

## Getting started

### Requirements

- Node.js 20 or newer
- The [backend](https://github.com/abdullahmamun1/gearup-backend-api) running,
  by default on `http://localhost:5000`

### Install and run

```bash
git clone https://github.com/abdullahmamun1/gearUp-frontend.git
cd gearUp-frontend
npm install
cp .env.example .env      # then fill it in (see below)
npm run dev               # http://localhost:3000
```

### Environment variables

| Variable                                  | Purpose                                                             |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `BACKEND_API_URL`                         | The API's base URL, e.g. `http://localhost:5000`                    |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | **Must match the backend exactly.** The site checks tokens itself.  |
| `GOOGLE_CLIENT_ID`                        | Google sign-in (the client secret belongs in the backend)           |
| `APP_URL` (optional)                      | Fixes the Google redirect URI to `APP_URL/api/auth/google/callback` |
| `SITE_URL` (optional)                     | Public origin for canonical URLs, the sitemap and share images      |

Every variable is server-only. Nothing uses `NEXT_PUBLIC_`, so no secret or
token ever reaches the browser.

### Google sign-in

In Google Cloud Console, open **APIs & Services → Credentials → Create OAuth
client ID → Web application** and add these redirect URIs. They must match
character for character:

```
http://localhost:3000/api/auth/google/callback
https://<your-domain>/api/auth/google/callback
```

Put `GOOGLE_CLIENT_ID` in this `.env`, and both `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` in the backend's. The same URI works for English and
Bangla pages.

### Payments

Stripe sends payment results to the backend's webhook, so forward it locally:

```bash
stripe listen --forward-to localhost:5000/api/payments/confirm
```

Pay with `4242 4242 4242 4242`, any future date and any CVC. The minimum order
is ৳65.

### Scripts

| Command                  | What it does                                                        |
| ------------------------ | ------------------------------------------------------------------- |
| `npm run dev`            | Development server                                                  |
| `npm run build`          | Production build                                                    |
| `npm start`              | Serve the build                                                     |
| `npm run lint`           | ESLint                                                              |
| `npm run typecheck`      | `tsc --noEmit`                                                      |
| `npm run format`         | Prettier                                                            |
| `npm run check:messages` | Every English text key exists in Bangla, with the same placeholders |
| `npm run check:contrast` | Every colour pair passes WCAG AA in both themes                     |

## Project structure

```
messages/
  en/  bn/            UI text, one JSON file per area (common, nav, gear, …)
src/
  app/
    [locale]/
      (public)/(marketing)/       home, gear, gear/[id], providers/[id], about, help, contact, privacy, newsletter
      (public)/(authentication)/  login, register, forgot and reset password, verify email
      (dashboard)/dashboard/      customer, provider and admin dashboards
      payment-success, payment-cancelled
    api/              route handlers for TanStack Query reads, Google OAuth, CSV export
    sitemap.ts  robots.ts  manifest.ts
  api/                "use server" functions, one file per backend module
  components/
    ui/               shadcn primitives (Base UI)
    shared/           GearCard, DataTable, form fields, maps, motion kit, illustrations
    layout/           Navbar, Footer, DashboardSidebar, CommandPalette
    modules/          feature components by area (marketing, gear, auth, dashboard, customer, provider, admin, ai, orders)
  hooks/              TanStack Query hooks, session, favourites, unread counts
  i18n/               routing, navigation, translators, formatting
  lib/                apiFetch, session, cookies, jwt, site metadata, OG images
  constants/  routes/  utils/  validation/  providers/  types/
  proxy.ts            auth checks and language routing for every request
public/
  sw.js  offline.html  icons/
```

Route files in `app/` stay thin. The UI lives in `components/modules/<area>/`.

## How it works

### Talking to the API

- The browser never calls the API directly. Server Components, Server Actions
  and route handlers call it through `apiFetch` (`src/lib/apiClient.ts`).
- `apiFetch` never throws. It always returns
  `{ success, statusCode, message, data }`, so callers branch on `success`.
- Reads for dashboard tables go through `app/api/*` route handlers and TanStack
  Query. The server renders page 1 and passes it in as initial data.
- Every write is a Server Action. The client wraps it in `useMutation`, shows a
  toast and refreshes both caches (`revalidateTag` on the server,
  `invalidateQueries` in the browser).
- Filters, sorting and pages live in the URL, so every view can be shared and
  the back button works.

### Sign-in and route protection

- The API returns the access and refresh tokens. The site stores them in
  httpOnly cookies, so JavaScript can't read them.
- `src/proxy.ts` checks the token on each request, refreshes it silently when it
  expires and keeps each role inside its own `/dashboard/<role>` area.
  Suspended users are signed out.
- The frontend checks are for user experience only. The API enforces every
  role rule itself.

### Rendering and caching

- **Public pages are static.** Home, browse, about, help, contact and the auth
  pages are prerendered for both languages. Gear and provider pages are
  rebuilt in the background every 5 minutes.
- Public pages never read cookies, headers or query strings on the server.
  Signed-in details (account button, saved items) load in small client
  components after the page appears.
- Only public reads use the Next.js Data Cache. Signed-in requests are never
  cached.
- Forms render outside Suspense, so text typed before the page finishes loading
  is kept.

### Languages

- English pages have plain URLs (`/gear`). Bangla pages live under `/bn`
  (`/bn/gear`).
- All UI text lives in `messages/en` and `messages/bn`. Keys are type-checked
  against English, and `npm run check:messages` keeps both languages in step.
- Prices, dates and numbers use Bengali digits on Bangla pages. Dashboards can
  switch to Latin digits.
- Data such as gear names, reviews and people's names is never translated.
- The language switcher saves the choice to the account, which also sets the
  language of emails.

### Design system

- Tailwind 4 is configured in `src/app/globals.css` with colour tokens for
  light and dark themes.
- Three brand colours: **Pine** for actions and links, **Ember** for the main
  call to action, **Lagoon** for information.
- Headings use Bricolage Grotesque, body text Plus Jakarta Sans, and Bangla
  text Hind Siliguri.
- Animations move only `transform` and `opacity` and respect reduced motion.
  Content never waits for JavaScript to become visible.
- `/styleguide` (development only) shows every token, component and
  illustration.

### SEO and installable app

- Each public page has its own title, description, canonical URL and `hreflang`
  links for both languages.
- Gear, providers, the FAQ and the organisation have structured data
  (JSON-LD). Gear and provider pages get their own share images.
- A sitemap and robots file are generated. Dashboards and auth pages are
  `noindex`.
- A service worker caches static assets and shows an offline page. The site
  can be installed as an app.

## Checking your changes

There is no automated test suite. Before you push:

```bash
npm run lint
npm run typecheck
npm run check:messages
npm run build
```

Then try the flow you changed in the browser, in both languages and at phone
and desktop widths. The build output should show the public pages as static
(`○` or `●`). A public page that turns dynamic (`ƒ`) usually means it started
reading cookies, headers or query strings on the server.

## Deploying to Vercel

1. Import the repository and set the variables from
   [Environment variables](#environment-variables). `BACKEND_API_URL` points
   at the deployed API, and the JWT secrets match it.
2. Set the backend's `APP_URL` to this site's origin. Stripe's return links and
   the links in emails are built from it.
3. Add `https://<your-domain>/api/auth/google/callback` to the Google OAuth
   client.
4. The build fetches data from the API to prerender pages. If the API is
   unreachable during the build, pages show empty states until they refresh
   (within 5 minutes).
