# Connecting Admin Panel ↔ Website

The admin panel talks to the Leo Group website catalog API.

## Quick start

**Terminal 1 — website (must be running first):**
```bash
cd leo-group-main
npm run dev
```
→ http://localhost:8080

**Terminal 2 — admin:**
```bash
cd maison-aurum-admin-panel
pnpm install
pnpm dev
```
→ http://localhost:3000

`.env.local` points at the website:
```
NEXT_PUBLIC_CATALOG_API_URL=http://localhost:8080
NEXT_PUBLIC_WEBSITE_URL=http://localhost:8080
```

Add or edit a product in admin → refresh the website shop/product page to see it live.
