# UrbanThreads

A full-featured e-commerce website for plus-size fashion (sizes 1X–5X) for men and women. Warm terracotta/amber branding, Clerk authentication, shopping cart, checkout, order placement and delivery tracking.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/urbanthreads run dev` — run the React frontend (port 24195)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, wouter, TanStack Query, Clerk auth
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/` — Drizzle schema (products, categories, cart_items, orders, order_items, addresses)
- `lib/api-spec/` — OpenAPI spec source of truth
- `lib/api-client-react/` — generated React Query hooks (from Orval)
- `artifacts/api-server/src/routes/` — products, cart, orders, addresses routes
- `artifacts/urbanthreads/src/` — React frontend
  - `pages/` — HomePage, MensPage, WomensPage, ProductDetailPage, CartPage, CheckoutPage, OrdersPage, OrderDetailPage
  - `components/` — Navbar, Footer, ProductCard, shadcn/ui components

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks
- Clerk auth with proxy URL for Replit compatibility; cart/orders require auth
- All product images fall back to placehold.co if remote image fails to load
- Cart item count shown on navbar icon without requiring authentication
- Shipping is free over $75, otherwise $7.99

## Product

- Browse men's and women's plus-size fashion by category and price
- View product details, select sizes (1X–5X), add to cart (requires sign-in)
- Shopping cart with quantity controls, item removal, order summary
- Checkout: add/select delivery address, place order (demo mode, no real payment)
- Order history with status tracking (pending → confirmed → processing → shipped → delivered)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `products.maxPrice` filter uses string comparison in the DB (price is stored as `varchar`); works for typical price ranges but not exact float comparison
- Clerk dev keys have strict usage limits — switch to production keys before deploying

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `.local/skills/clerk-auth/` for Clerk configuration details
