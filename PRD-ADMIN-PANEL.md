# PRD: LEO GROUP Admin Panel

**Product:** LEO GROUP / MAISON AURUM storefront  
**Audience for this doc:** v0 (UI generation) + engineering  
**Goal:** Build a production-ready admin panel where the admin can add products, edit any product, maintain stock, upload images/media — and **every change must appear immediately on the public website**.

---

## 1. Problem

Today the website catalog is mostly hardcoded. There is a demo `/admin` page that stores edits in browser `localStorage`, so:

- Admin changes do **not** show on the live shop, homepage, or product pages for other visitors.
- Stock, images, and full product fields are incomplete or disconnected from the storefront.

We need a real admin panel + shared catalog so the website always reflects admin data.

---

## 2. Success criteria (non-negotiable)

1. Admin can **create**, **edit**, **publish/unpublish**, and **delete** products.
2. Admin can **upload product images** (and optionally replace them).
3. Admin can **set and update stock quantity** per product.
4. Any saved change in admin (product fields, images, stock, publish state) is **visible on the public website** without redeploying code.
5. Website pages that must read live catalog data:
   - Homepage featured / category product grids
   - Shop listing (`/shop/{category}/{sub}`)
   - Product detail page (`/product/{id}`)
6. Out-of-stock or zero stock products should be clearly indicated on the site (badge + disabled buy CTA if buy exists).
7. Admin area is **login-protected** and `noindex`.

---

## 3. Brand context (for UI)

LEO GROUP has two storefront verticals:

| Vertical | Brand label | Category code |
|----------|-------------|---------------|
| Perfume | LEO SIGNATURE / Maison de Perfume | `parfum` |
| Tech / accessories | LEO TECH HUB | `tech` |

**Design direction for admin UI (v0):**

- Dark luxury admin shell: near-black backgrounds, soft amber/gold accents (`amber-200` / champagne gold).
- Typography: elegant serif for headings (Cormorant Garamond or similar), clean sans for forms/tables.
- Dense but calm dashboard — tables + side panels, not marketing hero layouts.
- Desktop-first (admin), usable on tablet.
- No purple gradients, no playful cards clutter, no emoji.

---

## 4. Users & auth

### Persona
- Store owner / catalog manager (single admin role for v1).

### Auth (v1)
- Email + password login screen.
- Session persists until logout.
- Placeholder credentials OK in UI mock; note that production must use real auth (not hardcoded client-side passwords).

**Login screen copy:**
- Title: Admin
- Heading: MAISON AURUM
- Subtitle: Sign in to manage catalog, stock, and media.

---

## 5. Information architecture

Admin app route: `/admin` (or `/admin/*`).

### Navigation tabs / sidebar

1. **Dashboard** — counts & low-stock alerts  
2. **Products** — list + create/edit (core)  
3. **Stock** — inventory focus view  
4. **Media** — product image uploads/management  
5. *(Optional v1.1)* Orders, Users, Reviews  

**v0 priority:** Login + Dashboard + Products (full CRUD) + Stock + Media. Keep Orders/Users as simple placeholder pages if included.

---

## 6. Core features

### 6.1 Dashboard
Show cards:
- Total products
- Products by category (`parfum` / `tech`)
- Low stock count (qty &lt; 10)
- Out of stock count (qty = 0)
- Recently updated products (last 5)

Low-stock table: product name, category, qty, quick “Adjust stock” link.

### 6.2 Products — list
Table/grid of products with:

| Column | Notes |
|--------|--------|
| Thumbnail | first image |
| Name | |
| Line | collection/line label |
| Category | parfum / tech |
| Sub-category | slug |
| Price | € |
| Stock | qty + status chip |
| Status | Draft / Published |
| Tag | e.g. Iconic, New, Bestseller |
| Actions | Edit, Duplicate, Delete |

Filters: search by name, filter by category, sub-category, stock status, publish status.  
Primary CTA: **Add product**.

### 6.3 Products — create / edit form

Single form with sections. Category toggles which optional fields show.

#### Always required
- `name` (string)
- `category`: `parfum` | `tech`
- `subCategory` (required for shop filters — see lists below)
- `line` (string, e.g. “Maison Noir”, “Audio”)
- `price` (number, EUR)
- `tag` (string badge)
- `short` (short blurb)
- `description` (long text)
- `images` (1–8 images; first = primary)
- `stock` (integer ≥ 0)
- `status`: `draft` | `published`
- `id` (slug; auto-generated from name, editable; unique)

#### Perfume-only fields (`category === "parfum"`)
- `notes.top[]`, `notes.heart[]`, `notes.base[]`
- `concentration` (e.g. “Extrait de Perfume 30%”)
- `volumes[]` (e.g. 50ml, 100ml, 200ml)
- `perfumer`
- `ingredients`

#### Tech-only fields (`category === "tech"`)
- `specs` (key/value pairs)
- `compatibility[]`
- `inTheBox[]`

#### Reviews (optional editor in v1)
- List of reviews: `name`, `title`, `rating` (1–5), `body`, `date`
- Aggregate `rating` number (editable or auto-average)

#### Sub-category enums

**Parfum:**  
`for-her` | `for-him` | `attars` | `testers` | `new-arrivals` | `limited-edition`

**Tech:**  
`chargers` | `power-banks` | `earphones` | `speakers` | `smartwatches` | `adapters` | `lightning-chargers` | `wires` | `beauty-care` | `other-hoco`

#### Form actions
- Save draft
- Publish / Unpublish
- Delete product (confirm dialog)
- Cancel / back to list

**After save:** product must appear/update on the public website according to status:
- `published` + stock rules → visible in shop/home/PDP
- `draft` → hidden from public site

### 6.4 Stock management
Dedicated **Stock** page:
- Searchable table: product, SKU/id, category, current qty, status (In stock / Low / Out)
- Inline edit qty or “Adjust” modal (+/− / set absolute)
- Bulk: set low-stock threshold (default 10)
- Saving stock updates public site (out-of-stock badge / buy disabled)

### 6.5 Media / uploads
- Upload images from computer (drag-drop + file picker)
- Preview thumbnails, reorder (primary image = first), delete
- Accept JPG/PNG/WebP; max ~5MB each (show validation message)
- Pasting external URL allowed as secondary option
- Uploaded assets must be usable on the website product cards and PDP gallery

### 6.6 Website sync (critical product requirement)

**Behavior contract for v0 + engineering notes:**

| Admin action | Public website result |
|--------------|------------------------|
| Add published product | Appears in matching category/sub shop grid and eligible homepage sections |
| Edit name/price/images/copy | PDP + cards update |
| Change subCategory | Product moves between shop filters |
| Set stock to 0 | Show “Out of stock”; disable purchase CTA |
| Set stock &lt; 10 | Optional “Low stock” cue on PDP (nice-to-have) |
| Unpublish / delete | Removed from public listings; PDP 404 or “unavailable” |

v0 should design UI assuming a shared catalog API/store (not `localStorage`-only). Include subtle UI feedback: “Saved — live on website” toast after successful save.

---

## 7. Data model (TypeScript shape for implementation)

```ts
type Category = "parfum" | "tech";
type PublishStatus = "draft" | "published";

type Product = {
  id: string;
  category: Category;
  subCategory: string;
  name: string;
  line: string;
  price: number;
  tag: string;
  images: string[];      // CDN/public URLs after upload
  short: string;
  description: string;
  stock: number;         // NEW — required for inventory
  status: PublishStatus; // NEW — controls website visibility
  updatedAt: string;     // ISO

  // parfum
  notes?: { top: string[]; heart: string[]; base: string[] };
  concentration?: string;
  volumes?: string[];
  perfumer?: string;
  ingredients?: string;

  // tech
  specs?: Record<string, string>;
  compatibility?: string[];
  inTheBox?: string[];

  reviews: Array<{
    name: string;
    title: string;
    rating: number;
    body: string;
    date: string;
  }>;
  rating: number;
};
```

---

## 8. Screens to generate in v0 (exact deliverables)

Generate a cohesive admin UI with these screens:

1. **Login**
2. **Dashboard**
3. **Products list** (with filters + Add product)
4. **Product create/edit** (long form with category-conditional sections + image uploader + stock field + publish controls)
5. **Stock inventory** table
6. **Empty states** (no products, no low stock)
7. **Confirm delete** dialog
8. **Success/error toasts**

Also provide a small **“Public preview”** strip or button on the product edit screen: “View on website” linking conceptually to `/product/{id}` (can be a button).

---

## 9. Component inventory (for v0)

- Sidebar or top tab nav
- Stat cards
- Data table with search + filters
- Form inputs: text, number, textarea, select, multi-tag input (chip lists for notes/volumes/compatibility)
- Key/value editor for tech `specs`
- Image dropzone with reorder
- Status badges: Published, Draft, In stock, Low stock, Out of stock
- Modal / sheet for stock adjust
- Login card
- Toast notifications

Use shadcn/ui-style components (Button, Input, Select, Table, Dialog, Tabs, Badge, Switch, Textarea).

---

## 10. Public website surfaces that consume admin data

When implementing (beyond pure UI), wire catalog reads so these use the **same product source** as admin:

- Home: featured product grids filtered by active vertical (`parfum` / `tech`)
- Shop: `/shop/$category/$sub` — filter by `category` + `subCategory` (`all` = every sub)
- PDP: `/product/$id` — gallery, price, tag, description, perfume notes or tech specs, stock state

**Do not** keep a separate hardcoded `products.ts` as the live source of truth once admin is connected.

---

## 11. Out of scope for v1 (do not overbuild in v0)

- Full e-commerce checkout / payments
- Multi-admin roles / permissions matrix
- Advanced analytics
- Email campaigns
- Warehouse multi-location stock
- Automated supplier sync

Orders & customers can be static placeholder UI only.

---

## 12. Acceptance checklist

- [ ] Admin can log in and open Products
- [ ] Admin can add a new perfume product with notes, volumes, images, stock
- [ ] Admin can add a new tech product with specs, compatibility, images, stock
- [ ] Admin can edit any existing product field and save
- [ ] Admin can change stock; website reflects in-stock / out-of-stock
- [ ] Admin can upload images; website gallery/cards show them
- [ ] Unpublished products do not appear on public shop/home
- [ ] Published products appear in correct category + sub-category listing
- [ ] Delete requires confirmation and removes product from site
- [ ] UI matches dark luxury LEO GROUP admin aesthetic
- [ ] Mobile/tablet: forms usable; tables scroll horizontally if needed

---

## 13. Suggested v0 prompt (copy-paste)

Use this as the main v0 prompt; attach this PRD if possible.

```text
Build a dark luxury Admin Panel UI for LEO GROUP / MAISON AURUM (perfume + tech accessories store).

Stack look: React + Tailwind + shadcn/ui. Desktop-first.

Screens:
1) Login (email/password)
2) Dashboard with product counts and low-stock alerts
3) Products list with search/filters and Add Product
4) Product create/edit form with:
   - required fields: name, category (parfum|tech), subCategory, line, price (€), tag, short, description, images, stock, status (draft|published)
   - perfume fields when category=parfum: fragrance notes (top/heart/base), concentration, volumes, perfumer, ingredients
   - tech fields when category=tech: specs key/value, compatibility chips, in-the-box chips
   - image drag-drop upload with reorder
   - publish/save/delete actions
5) Stock page with inline/adjust inventory and low/out badges

Design: near-black background, amber/champagne gold accents, Cormorant Garamond headings, clean sans body. No purple theme. Dense professional admin, not a marketing landing page.

Important product rule to reflect in UI copy/toasts: whatever the admin saves (products, stock, images, publish state) must go live on the public website.

Include empty states, delete confirmation dialog, and “Saved — live on website” toast.
```

---

## 14. Engineering follow-up (after v0 UI)

For the UI to actually sync with the Leo Group TanStack Start site:

1. Replace hardcoded `src/lib/products.ts` as runtime source with shared DB/API (e.g. Supabase, Convex, or TanStack server functions + Postgres).
2. Persist uploads to object storage (Vercel Blob / S3 / Supabase Storage).
3. Point homepage, shop, and PDP to fetch published products from that API.
4. Replace demo `sessionStorage` auth with real auth.
5. Keep existing route `/admin` and brand tokens where possible.

---

**Document owner:** LEO GROUP storefront  
**Version:** 1.0  
**Date:** 2026-07-16
