# Ieva Essentials / Ieva Vending

A three-language storefront preview and personal-care vending showcase.

## Local preview

Use Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the URL Vite prints. For a production build, run `npm run build`.

## Content

- `src/catalog.js` holds the online and vending assortments.
- `src/copy.js` holds the English, Latvian and Russian interface text.
- `public/images` contains illustrative photography. Replace these images with approved supplier photography when available.
- Locations, contact and support values are placeholders in the footer.
- The bag is stored in the browser for preview. Prices, orders, payments and supplier feeds are pending.

## Stripe test checkout

The preview works without Stripe credentials. To enable test payments, add two
server-side environment variables and restart Vite:

- `STRIPE_SECRET_KEY` — a Stripe sandbox secret beginning with `sk_test_`.
- `IEVA_CHECKOUT_ORIGIN` — the exact browser origin of the preview, e.g.
  `http://localhost:5173` or the HTTPS URL shown under Ports in Codespaces.

Use Codespaces secrets or a local `.env.local` file ignored by Git. Checkout uses
illustrative EUR prices and accepts EU delivery addresses for test input. Use
fictional checkout details. It does not quote shipping, confirm production orders
or send them to a supplier. This endpoint is for Vite dev and preview only. The
static build does not contain a server.
