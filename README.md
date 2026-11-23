# Evo Essentials / Evo Vending

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
