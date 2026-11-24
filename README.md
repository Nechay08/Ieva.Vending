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

The preview shows demo prices and lets you simulate checkout without credentials.
To open the Stripe sandbox checkout instead, add two server-side environment
variables and restart Vite:

- `STRIPE_SECRET_KEY` — a Stripe sandbox secret beginning with `sk_test_`.
- `IEVA_CHECKOUT_ORIGIN` — the exact browser origin of the preview, e.g.
  `http://localhost:5173` or the HTTPS URL shown under Ports in Codespaces.

Use Codespaces secrets or a local `.env.local` file ignored by Git. Checkout uses
illustrative EUR prices and accepts EU delivery addresses for test input. Use
fictional checkout details. It does not quote shipping, confirm production orders
or send them to a supplier. This endpoint is for Vite dev and preview only. The
static build does not contain a server.

## Save paid test orders

In Codespaces, install the [Stripe CLI](https://docs.stripe.com/cli/install).
Run `stripe login` and authorize **Ieva Vending SIA sandbox**. In a separate
terminal, start the listener:

```sh
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to http://localhost:5173/api/stripe/webhook
```

Add its `whsec_…` signing secret as `STRIPE_WEBHOOK_SECRET` in `.env.local`
and restart Vite while leaving the listener running. Use the port printed by Vite
if it differs from 5173. Keep the Stripe CLI and the checkout API key on the same
sandbox. Complete a new test checkout from Ieva, then run
`ls -la .ieva-orders`. Each paid session creates one JSON record with product
IDs, quantities, amount and Stripe IDs. Repeated deliveries leave that record
intact. The folder is local to the workspace, excluded from Git and blocked from
web access. Records omit customer contact and address details. Older checkouts
lack the Ieva metadata and are skipped.
