# Ajoin & Shine — webshop

Direct-to-consumer shop for Ajoin & Shine onion hair care. Belgium, the Netherlands, France and Italy, in Dutch (default), English, French and Italian.

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · next-intl · Stripe Checkout · Drizzle + Neon Postgres · Resend · Vercel.

## Status: showcase mode

While `STRIPE_SECRET_KEY` is empty the shop runs in **showcase mode**: everything can be browsed and added to the cart, but checkout and the forms (newsletter, contact, order lookup, withdrawal) show an "opening soon" message instead of acting. A banner at the top says so. Search engines are kept out until `NEXT_PUBLIC_ALLOW_INDEXING=true`.

Live checkout is also blocked in code while the catalogue or shipping config still contains placeholders, so real money can never be taken against sample prices. `/admin` lists what's still open.

## What's still placeholder

Search the code for `TODO_` to find every open item. In short:

| What | Where |
| --- | --- |
| Product names, prices, INCI, copy, warnings, claims | `content/catalogue/products.ts` |
| Shipping carriers, rates, free-shipping threshold | `content/shipping.ts` |
| Company and Responsible Person details | `src/lib/site.ts` |
| Brand story, ingredient texts, FAQ answers | `content/pages/<locale>/*.mdx` |
| Legal texts (drafts, need legal review) | `content/pages/<locale>/{terms,privacy,legal-notice,shipping}.mdx` |
| Product photos (placeholders are sized 1200×1500) | `public/images/` |

Unfilled values are hidden from visitors automatically (`pub()` in `src/lib/site.ts`, MDX comments in content), so the showcase looks finished while the gaps stay visible in code.

## Local setup

```bash
npm install
cp .env.example .env.local   # everything is optional for showcase mode
npm run dev                  # http://localhost:3000 → redirects to /nl
```

| Script | Does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Unit tests (Vitest): cart, pricing, Stripe session building |
| `npm run e2e` | Playwright on a mobile viewport. `E2E_BASE_URL=https://… npm run e2e` runs it against a deployed site; add `E2E_STRIPE=1` once that site has Stripe test keys |
| `npm run typecheck` / `lint` | Types and ESLint |
| `npm run db:generate` | New migration after editing `src/lib/db/schema.ts` |

## Structure

```
content/catalogue/products.ts   products, bundles, subscription plans (typed)
content/shipping.ts             rates per country, free-shipping threshold
content/pages/<locale>/         MDX: about, ingredients, faq, legal pages
content/blog/                   journal posts (index.ts + one MDX per locale)
messages/<locale>.json          all UI strings
src/lib/catalogue/              CatalogueProvider interface + local provider (swap for CMS/Odoo here)
src/lib/cart/                   pure cart and pricing logic (client and server use the same code)
src/lib/stripe/checkout.ts      builds Checkout sessions from a server-priced cart
src/lib/orders.ts               webhook → orders (idempotent)
src/app/[locale]/               storefront routes
src/app/api/                    checkout, webhook, newsletter, contact, order lookup, withdrawal, billing portal
src/app/admin/                  order list (basic auth via src/proxy.ts)
```

## Going live: payments and email

1. **Database.** Vercel → Storage → Neon (region Frankfurt), connect to the project. Migrations in `drizzle/` run automatically during each Vercel build (`scripts/migrate.mjs`).
2. **Stripe** (start in test mode):
   - `STRIPE_SECRET_KEY`.
   - Webhook endpoint `https://<domain>/api/stripe/webhook` with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `charge.refunded` → `STRIPE_WEBHOOK_SECRET`. Signatures are verified; processed events are recorded so redeliveries are ignored.
   - Payment methods (dashboard): cards, Bancontact, iDEAL, PayPal, Apple Pay, Google Pay. Checkout uses whatever is enabled.
   - Customer portal: activate it (subscribers manage subscriptions there).
   - Stripe Tax: add registrations (Belgium; OSS for the other countries), then `STRIPE_AUTOMATIC_TAX=true`. Prices are VAT-inclusive; Stripe Tax extracts the right VAT for the destination.
   - Local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
3. **Email.** Resend API key, a verified sending domain, `EMAIL_FROM`, `CONTACT_TO_EMAIL`.
4. **Admin.** `ADMIN_USER`, `ADMIN_PASSWORD`. `/admin` stays closed while these are unset.
5. Fill every placeholder above, have the legal pages reviewed, then switch to live Stripe keys and set `NEXT_PUBLIC_ALLOW_INDEXING=true`.

## How checkout works

- The cart lives in the browser (localStorage). At checkout the server re-prices it from the catalogue, so the client never decides what is charged.
- The customer picks the destination country in the cart; Checkout gets that country's rate (free above the threshold) and only accepts addresses in it.
- One-off orders use payment mode. Carts with a subscription use subscription mode; shipping then becomes a recurring line on the same interval. Subscriptions with different intervals can't share one order.
- Renewal invoices (`invoice.paid`, `subscription_cycle`) become their own orders for fulfilment.

## Compliance notes

- Cosmetics claims: only brand-supplied, reviewed claims (`reviewed: true`) are shown. No medical claims.
- Product pages show INCI, net content, PAO, warnings and the Responsible Person once filled in.
- Online withdrawal function (EU 2023/2673, in force since 19 June 2026) at `/withdrawal`, with emailed acknowledgement, plus the model form.
- No ODR-platform link: the EU ODR platform closed in July 2025.
- Cookie banner appears only when an analytics tool is configured; analytics load only after consent.
- Newsletter uses double opt-in; the confirmation time is stored as the consent record.
- Reference ("was") prices: set `lowestPrice30dCents` on a variant to show the Omnibus lowest-price line.
