# Connecting the Maison Aurum Admin Panel to the Leo Group website

## How it works

1. The **website** (`leo-group-main`) hosts a shared catalog API and stores products in `data/catalog.json`.
2. The **admin panel** (`maison-aurum-admin-panel`) reads/writes that API.
3. Home, shop, and product pages load published products from the same catalog — so admin changes appear on the site.

## Run both apps

### 1. Website (API + storefront) — port 8080

```bash
cd leo-group-main
npm install
npm run dev
```

Open http://localhost:8080

### 2. Admin panel — port 3000

```bash
cd maison-aurum-admin-panel
pnpm install   # or npm install
pnpm dev       # or npm run dev
```

Open http://localhost:3000

Admin login: any email + password (demo session).

Env (already in `.env.local`):

```
NEXT_PUBLIC_CATALOG_API_URL=http://localhost:8080
NEXT_PUBLIC_WEBSITE_URL=http://localhost:8080
```

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/catalog` | List all products |
| GET | `/api/catalog?public=1` | Published only |
| POST | `/api/catalog` | Create product |
| GET | `/api/catalog/:id` | Get one |
| PUT | `/api/catalog/:id` | Update |
| DELETE | `/api/catalog/:id` | Delete |
| PATCH | `/api/catalog/:id/stock` | Set stock |

## Verify sync

1. In admin → Products → New Product → save as **published**
2. Refresh the website home or shop — the product should appear
3. Edit price/stock in admin → refresh product page on the website

## Production note

`data/catalog.json` works for local/Node hosting. On serverless (Vercel), file writes do not persist — move the catalog to a database or blob store before production deploy.
