# Connecting Admin to the Website

## Live URL

When your site is deployed, the admin panel is on the **same domain**:

```
https://YOUR-DOMAIN.com/admin
```

Locally:

```
http://localhost:8080/admin
```

### Login (demo — change before production)
- Email: `admin@leogroup.com`
- Password: `LeoAdmin@2026`

Add / edit / stock changes go live on the shop immediately via `/api/catalog`.

## Run locally

```bash
cd leo-group-main
npm run dev
```

Open http://localhost:8080/admin

## Production note

`data/catalog.json` needs a persistent server. On Vercel serverless, move catalog storage to a database before relying on production admin edits.
