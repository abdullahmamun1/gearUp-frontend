# API Integration

How this frontend talks to the GearUp API — every endpoint, the module that
calls it, and the component you'd land on if you followed it from the UI.

**Base URL:** `process.env.BACKEND_API_URL` (default `http://localhost:5000`)

**Test admin:** `admin@gearup.com` / `Password123`

---

## The one rule

**The backend is only ever called from the server.** Never from a browser
`fetch`.

Every request goes through `apiFetch` in [lib/api.ts](./lib/api.ts), which runs
in a Server Component, a `"use server"` action, or a Route Handler. It reads the
access token out of the httpOnly cookie and forwards it as a `Cookie` header.

That cookie is scoped to the Next origin, so a client component _could not_ call
`localhost:5000` with credentials even if we wanted it to. That constraint is
why [`app/api/*`](./app/api) exists — see [Route Handlers](#route-handlers-appapi).

### `apiFetch` never throws

Failures come back as data, including network errors:

```ts
{ success: false, statusCode: 503, message: "Could not reach the server…", data: null }
```

So every caller handles success and failure the same way — no try/catch at call
sites. See [Error handling](#error-handling).

### Caching

`apiFetch` defaults to `cache: "no-store"`. It opts into Next's Data Cache only
when `tags` or `revalidate` is passed.

**This is deliberate and load-bearing.** The Data Cache keys on URL alone — not
on headers or cookies. Since auth rides in a `Cookie` header, caching any
per-user response would serve one user's rentals to another. Only the four
public, unauthenticated reads are cached; every authenticated read stays
`no-store`.

---

## Endpoints

32 endpoints. The frontend calls 31 — `POST /api/payments/confirm` is Stripe's
webhook and is only ever called by Stripe.

### Auth — `/api/auth`

| Endpoint              | Guard                   | Frontend module                                                            | Used by                |
| --------------------- | ----------------------- | -------------------------------------------------------------------------- | ---------------------- |
| `POST /register`      | public                  | `registerUser` — [service/auth.ts](./service/auth.ts)                      | `RegisterForm`         |
| `POST /login`         | public                  | `loginUser` — [service/auth.ts](./service/auth.ts)                         | `LoginForm`            |
| `POST /refresh-token` | public (refresh cookie) | `getNewAccessToken` — [service/refreshToken.ts](./service/refreshToken.ts) | [proxy.ts](./proxy.ts) |
| `GET /me`             | any role                | `getCurrentUser` — [service/currentUser.ts](./service/currentUser.ts)      | [proxy.ts](./proxy.ts) |
| `PATCH /me`           | any role                | `updateProfile` — [\_actions/updateProfile.ts](<./app/(dashboard)/_actions/updateProfile.ts>) | `ProfileForm`          |

`loginUser` writes both cookies via `setAuthCookies`, decodes the access token to
pick a landing page, then `redirect()`s. The token never reaches the browser as
JS-readable state.

`PATCH /me` accepts `name` and `phone` only — a partial body, but not an empty
one. Anything else in the payload is stripped by Zod before it reaches Prisma,
so `role`, `status` and `email` cannot be edited by the account that owns them.
An empty-string `phone` is the documented way to clear the number.

The two `service/` modules use a raw `fetch` rather than `apiFetch`, because
they run inside the proxy and must send a _specific_ token rather than the one in
the current cookie jar.

### Public catalogue

| Endpoint                | Frontend module                                                                      | Cache                           | Used by                                             |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------- | --------------------------------------------------- |
| `GET /api/gear`         | `getGear` — [app/(public)/_actions/getGear.ts](<./app/(public)/_actions/getGear.ts>) | tags `gear`, 5 min              | `GearResults`, `FeaturedGear`                       |
| `GET /api/gear/:gearId` | `getGearById` — same file                                                            | tags `gear`, `gear:{id}`, 5 min | gear detail page                                    |
| `GET /api/categories`   | `getCategories` — [getCategories.ts](<./app/(public)/_actions/getCategories.ts>)     | tags `categories`, 1 hr         | `CategoryStrip`, both filter bars, `GearFormDialog` |
| `GET /api/brands`       | `getBrands` — [getBrands.ts](<./app/(public)/_actions/getBrands.ts>)                 | tags `brands`, `gear`, 1 hr     | `GearFilterBar`                                     |

These four are `auth: false` and cached — they are identical for every visitor,
which is exactly what makes them safe to cache and what makes the browse pages
server-rendered for SEO.

`GET /api/gear` accepts `searchTerm`, `category`, `brand`, `minPrice`,
`maxPrice`, `isAvailable`, `sortBy`, `sortOrder`, `page`, `limit`. The frontend
never builds that query by hand — [lib/gearQuery.ts](./lib/gearQuery.ts) parses
it out of the URL and back again.

### Reviews

| Endpoint                        | Guard    | Frontend module                                                                  | Used by        |
| ------------------------------- | -------- | -------------------------------------------------------------------------------- | -------------- |
| `GET /api/gear/:gearId/reviews` | public   | `getReviews` — [getReviews.ts](<./app/(public)/_actions/getReviews.ts>)          | `GearReviews`  |
| `POST /api/reviews`             | customer | `createReview` — [createReview.ts](<./app/(dashboard)/_actions/createReview.ts>) | `ReviewDialog` |

The list response carries a `summary` with the average rating and total, so the
detail page shows an aggregate without a second request.

`Review.rentalOrderId` is `@unique` on the backend: **one review per order**, not
per gear item. That's why `ReviewDialog` asks which item the review is about when
an order has more than one.

**The home page's review slider has no endpoint of its own.** There is no
cross-gear review listing, so `getTestimonials()` fans out: the gear list
already reports `rating.count` per item, so it filters to items that actually
have reviews, caps that at 6, and fetches those pages in parallel. Today that is
**2 requests**; the ceiling is 7, and every one of them is cached. If review
volume ever makes that fan-out the wrong shape, the fix is a
`GET /api/reviews?limit=N` on the backend and a one-line swap here.

### Rentals — `/api/rentals`

| Endpoint                 | Guard                       | Frontend module                                                               | Used by                                             |
| ------------------------ | --------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| `POST /`                 | customer                    | `createRental` — [createRental.ts](<./app/(public)/_actions/createRental.ts>) | `RentPanel`                                         |
| `GET /`                  | customer                    | `getMyRentals`                                                                | orders page, customer home, `/api/customer/rentals` |
| `GET /:orderId`          | customer · provider · admin | `getRentalById`                                                               | order detail page                                   |
| `PATCH /:orderId/cancel` | customer                    | `cancelRental`                                                                | `CancelOrderButton`                                 |

### Payments — `/api/payments`

| Endpoint          | Guard            | Frontend module  | Used by                                 |
| ----------------- | ---------------- | ---------------- | --------------------------------------- |
| `POST /create`    | customer         | `createPayment`  | `PayButton`                             |
| `GET /`           | customer         | `getMyPayments`  | payments page, `/api/customer/payments` |
| `GET /:paymentId` | customer         | `getPaymentById` | payment receipt page                    |
| `POST /confirm`   | Stripe signature | —                | **not called by this app**              |

`createPayment` returns a Stripe Checkout URL; `PayButton` redirects to it.
Stripe then calls `/confirm` server-to-server and sends the customer back to
`/payment-success` or `/payment-cancelled`.

Because confirmation arrives out of band, the payments table polls while
anything is `PENDING` — see [Polling](#polling).

### Provider — `/api/provider`

Every route here is `auth(PROVIDER)` at the router level.

| Endpoint                 | Frontend module     | Used by                                                  |
| ------------------------ | ------------------- | -------------------------------------------------------- |
| `GET /gear`              | `getProviderGear`   | `ProviderGearTable`, provider home, `/api/provider/gear` |
| `POST /gear`             | `createGear`        | `GearFormDialog`                                         |
| `PUT /gear/:gearId`      | `updateGear`        | `GearFormDialog`, `AvailabilityToggle`                   |
| `DELETE /gear/:gearId`   | `deleteGear`        | `DeleteGearDialog`                                       |
| `GET /orders`            | `getProviderOrders` | orders page, provider home                               |
| `PATCH /orders/:orderId` | `updateOrderStatus` | `OrderStatusButton`                                      |

**`PUT` is a full replace, not a patch.** A cleared optional field must be sent
explicitly as `""` or the old value survives. `toGearPayload` in
[lib/schemas/gear.ts](./lib/schemas/gear.ts) is what gets this right, and it is
why create and edit have opposite blank-field semantics.

`AvailabilityToggle` reuses `updateGear` to flip one boolean, optimistically.

### Admin — `/api/admin`

Every route here is `auth(ADMIN)` at the router level.

| Endpoint                       | Frontend module                                                                       | Used by                                   |
| ------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| `GET /users`                   | `getAdminUsers` — [getAdminTables.ts](<./app/(dashboard)/_actions/getAdminTables.ts>) | `AdminUsersTable`, `/api/admin/users`     |
| `PATCH /users/:userId`         | `updateUserStatus`                                                                    | `UserStatusToggle`                        |
| `GET /gear`                    | `getAdminGear`                                                                        | `AdminGearTable`, `/api/admin/gear`       |
| `GET /rentals`                 | `getAdminRentals`                                                                     | `AdminRentalsTable`, `/api/admin/rentals` |
| `POST /category`               | `createCategory`                                                                      | `CategoryFormDialog`                      |
| `PATCH /category/:categoryId`  | `updateCategory`                                                                      | `CategoryFormDialog`                      |
| `DELETE /category/:categoryId` | `deleteCategory`                                                                      | `DeleteCategoryDialog`                    |

The admin dashboard's stat cards call the three listings in parallel with
`limit=1` and read only `meta.total` — see `getAdminCounts`.

**The two overview charts add no endpoints.** `getRentalsByStatus` in
[getAdminCharts.ts](<./app/(dashboard)/_actions/getAdminCharts.ts>) fires
`GET /rentals?status=…&limit=1` once per status and keeps only `meta.total`, so
six counts cost six headers and no order bodies. `getGearByCategory` calls the
public `getCategories()` — `_count.gearItems` is already on every row — which
means it rides the same hour-long `categories` cache tag the category CRUD
already invalidates, and a new category shows up in the chart the moment one is
created.

`DELETE /category/:id` refuses with a 400 while any listing references the
category. `DeleteCategoryDialog` reads `_count.gearItems` and disables the
button up front, so the guard is explained before it fires rather than after.

---

## Table filtering

Filtering and pagination added on **every** dashboard table. Four endpoints
gained query filters to make that real:

| Endpoint                | Filters                                    |
| ----------------------- | ------------------------------------------ |
| `GET /admin/users`      | `role`, `status`                           |
| `GET /admin/gear`       | **`searchTerm`, `category`, `isAvailable`** |
| `GET /admin/rentals`    | `status`                                   |
| `GET /provider/gear`    | `searchTerm`, `category`, `isAvailable`, `sortBy`, `sortOrder` |
| `GET /provider/orders`  | **`status`**                               |
| `GET /rentals`          | `status`                                   |
| `GET /payments`         | **`status`**                               |

Bold entries are new. Each is validated at the router — an unknown status or a
malformed category id comes back as a 400, not a silently unfiltered list. The
frontend parsers (`lib/adminQuery.ts`, `lib/dashboardQuery.ts`) drop unknown
values before building the query, so a hand-typed `?status=BOGUS` renders the
unfiltered table rather than an error.

**Filters live in the URL, never in component state.** That is what lets the
server render the filtered page, makes a filtered view shareable, and lets
`Pagination` build page links that carry the current filters —
`buildHref(path, { ...filters, page })`.

**`GET /api/categories` is the one table that filters client-side.** It returns
a plain array with no `meta`, and public category dropdowns depend on that
shape, so `CategoriesList` filters and slices the six rows it already has.

---

## Who owns which data

|                                                              | Owner                                     |
| ------------------------------------------------------------ | ----------------------------------------- |
| SEO-relevant page data — home, browse, gear detail, reviews  | **Server Components** + Next's Data Cache |
| Dashboard tables — filtering, pagination, optimistic updates | **TanStack Query**                        |

Every dashboard table gets both. The server renders page one and hands it down
as `initialData`, so there's no loading flash and no request waterfall; TanStack
Query owns everything after that.

### Route Handlers (`app/api/*`)

Thin read endpoints that exist purely so client components can fetch without the
token leaving the server.

| Handler                      | Delegates to      |
| ---------------------------- | ----------------- |
| `GET /api/admin/users`       | `getAdminUsers`   |
| `GET /api/admin/gear`        | `getAdminGear`    |
| `GET /api/admin/rentals`     | `getAdminRentals` |
| `GET /api/admin/categories`  | `getCategories`   |
| `GET /api/customer/rentals`  | `getMyRentals`    |
| `GET /api/customer/payments` | `getMyPayments`   |
| `GET /api/provider/gear`     | `getProviderGear` |

Each one re-parses its query string through the **same whitelist parser the page
uses** (`parseAdminUsersFilters`, `parseProviderGearFilters`, …), so a
handcrafted `?limit=99999&page=-1` is normalised identically whether it arrives
by navigation or by fetch.

They add no authorisation of their own — they call the same server actions the
pages call, and the backend's role guards are what actually decide. Signed in as
an admin, `/api/customer/rentals` returns 403.

All seven return through `jsonResponse` in [lib/apiRoute.ts](./lib/apiRoute.ts),
which maps `success: false` onto the real HTTP status. Returning a 200 carrying
an error would get cached by TanStack Query as a success.

### Query hooks

[lib/queries/](./lib/queries) — `queryFetch` unwraps the envelope and throws on
`success: false`, which is what puts the message into `error.message`.

| Hook              | Key                          | Endpoint                 |
| ----------------- | ---------------------------- | ------------------------ |
| `useAdminUsers`   | `["admin-users", filters]`   | `/api/admin/users`       |
| `useAdminGear`    | `["admin-gear", filters]`    | `/api/admin/gear`        |
| `useAdminRentals` | `["admin-rentals", filters]` | `/api/admin/rentals`     |
| `useCategories`   | `["categories"]`             | `/api/admin/categories`  |
| `useMyRentals`    | `["my-rentals"]`             | `/api/customer/rentals`  |
| `useMyPayments`   | `["my-payments"]`            | `/api/customer/payments` |
| `useProviderGear` | `["provider-gear", filters]` | `/api/provider/gear`     |

Filters are part of the key, so each filter combination caches separately.
Paginated hooks use `placeholderData: keepPreviousData` — the current page stays
on screen while the next one loads, dimmed rather than blanked.

### Polling

`useMyPayments` is the one hook that polls, and only conditionally:

```ts
refetchInterval: (query) =>
  query.state.data?.data.some((p) => p.status === "PENDING") ? 5000 : false
```

Stripe confirms out of band, so a `PENDING` row can go `COMPLETED` with no user
action. Once nothing is pending, polling stops.

---

## Mutations

All writes are `"use server"` actions. Client components wrap them in
`useMutation` when there's a cache to keep honest.

| Component              | Action                              | Cache work                      |
| ---------------------- | ----------------------------------- | ------------------------------- |
| `AvailabilityToggle`   | `updateGear`                        | optimistic, rolls back on error |
| `UserStatusToggle`     | `updateUserStatus`                  | optimistic, rolls back on error |
| `GearFormDialog`       | `createGear` / `updateGear`         | invalidates `provider-gear`     |
| `DeleteGearDialog`     | `deleteGear`                        | invalidates `provider-gear`     |
| `CategoryFormDialog`   | `createCategory` / `updateCategory` | invalidates `categories`        |
| `DeleteCategoryDialog` | `deleteCategory`                    | invalidates `categories`        |
| `CancelOrderButton`    | `cancelRental`                      | invalidates `my-rentals`        |
| `OrderStatusButton`    | `updateOrderStatus`                 | server `refresh()`              |
| `PayButton`            | `createPayment`                     | redirects to Stripe             |
| `RentPanel`            | `createRental`                      | redirects to the new order      |
| `ReviewDialog`         | `createReview`                      | server revalidation             |
| `ProfileForm`          | `updateProfile`                     | re-mints the access token       |

### Two caches, both need telling

A server action's `revalidateTag`/`refresh` **cannot reach a client-owned
TanStack cache**, and `invalidateQueries` can't touch the Data Cache. Mutations
that affect both have to do both.

| Action                                               | Server invalidation                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `createGear`, `updateGear`, `deleteGear`             | `revalidateTag("gear")` + `refresh()`                                           |
| `createCategory`, `updateCategory`, `deleteCategory` | `revalidateTag("categories")` + `refresh()`                                     |
| `createReview`                                       | `revalidateTag("reviews:{gearItemId}")` + `revalidateTag("gear")` + `refresh()` |
| `updateUserStatus`                                   | `refresh()` only                                                                |

`revalidateTag` takes a second argument in Next 16 — `{ expire: 0 }` — and
`refresh()` covers the uncached per-user reads that no tag applies to.

`createReview` purges `gear` as well as its own review tag because browse cards
carry an aggregate rating. Without it, a new review would show on the detail page
while the card behind it kept a stale average for five minutes.

`updateUserStatus` has no tag to purge — admin listings are never cached — so it
only needs `refresh()`.

### `updateProfile` has a third cache: the token itself

The user's name is a **claim inside the access token**, and `getSession()` reads
the navbar and account menu straight out of that token rather than from the
database. Renaming yourself would therefore leave the old name in the header
until the token expired — `refresh()` can't fix that, because nothing is stale
on the server.

So the action calls `POST /api/auth/refresh-token` after a successful write. That
endpoint rebuilds the JWT payload from the row it just updated, so the new token
carries the new name, and `setAuthCookies` swaps it in.

---

## Auth flow

[proxy.ts](./proxy.ts) — Next 16's renamed `middleware.ts`, at the repo root —
guards every dashboard route:

1. Verify the access token locally with `JWT_ACCESS_SECRET`
2. If it's expired but the refresh token is good, `POST /api/auth/refresh-token`
   and set the new cookie on the response
3. Ask `GET /api/auth/me` for the user's **current** role and status

Step 3 is the one that matters. A token's claims are frozen at login, so without
it an admin promoting someone wouldn't take effect for 24 hours, and a suspended
user would keep browsing their dashboard until their token expired.

- **403 (suspended)** → sign out immediately, `?reason=suspended`
- **401** → sign out
- **role changed** → re-mint the token so it agrees with the database, rather
  than bouncing a legitimately-promoted user to `/not-found`
- **network failure** → `getCurrentUser` returns 503 and the proxy fails _open_,
  falling back to the token's claims. A backend blip shouldn't log everyone out.

Steps 1–2 need `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to match the backend
exactly. All three env vars are server-only — nothing is `NEXT_PUBLIC_`.

---

## Validation

Every payload is validated twice, and the two are independent.

**Client** — Zod schemas in [lib/schemas/](./lib/schemas) (`auth`, `category`,
`gear`, `review`) drive React Hook Form through `zodResolver`, so errors appear
inline before a request is made.

**Server** — the backend re-validates with its own Zod schemas via
`validateRequest` / `validateQuery` / `validateParams`. Client validation is a
convenience; the backend's is the one that counts. Query params are also capped
there — `limit` is bounded by `MAX_PAGE_SIZE`, so `?limit=99999` is a 400, not a
slow query.

---

## Error handling

`apiFetch` normalises everything — network failure, non-JSON response,
`{ success: false }` — into one shape. Callers branch on `res.success` and
render one of:

- a **field error** via `setError` (`RegisterForm`, `GearFormDialog`)
- a **toast** (`sonner`) for background mutations
- an **inline panel** — `EmptyState` for tables, `ErrorState` for route errors

Opaque backend messages are translated wherever there's enough context to say
something useful. Prisma's `"Duplicate Key Error"` reaches the user as _"An
account with this email already exists."_ — translated in `registerUser`
([service/auth.ts](./service/auth.ts)) because the action itself knows it was a
registration — and as _"A category with that name already exists."_, translated
in `CategoryFormDialog`, which additionally attaches it to the **`name` field**
rather than the form root, so the error lands on the input that caused it.

Detail pages call `notFound()` rather than rendering a message. The order and
payment pages treat **404 and 403 alike**, so a customer probing another
customer's order id gets the not-found page instead of a 403 that would confirm
the order exists. The gear page maps **404 and 400**, since a malformed id fails
UUID validation before anything is looked up.
