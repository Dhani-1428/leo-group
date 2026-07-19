/** Same-origin catalog client for the website /admin panel. */
import type { CatalogProduct } from "@/lib/catalogTypes";
import type { Category, PublishStatus } from "@/lib/products";

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function adminListProducts(): Promise<CatalogProduct[]> {
  const res = await fetch("/api/catalog", { cache: "no-store" });
  const data = await parse<{ products: CatalogProduct[] }>(res);
  return data.products;
}

export async function adminCreateProduct(
  product: Partial<CatalogProduct> & { id: string; name: string; category: Category },
): Promise<CatalogProduct> {
  const res = await fetch("/api/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await parse<{ product: CatalogProduct }>(res);
  return data.product;
}

export async function adminUpdateProduct(
  id: string,
  product: Partial<CatalogProduct>,
): Promise<CatalogProduct> {
  const res = await fetch(`/api/catalog/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await parse<{ product: CatalogProduct }>(res);
  return data.product;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/catalog/${encodeURIComponent(id)}`, { method: "DELETE" });
  await parse<{ ok: boolean }>(res);
}

export async function adminSetStock(id: string, stock: number): Promise<CatalogProduct> {
  const res = await fetch(`/api/catalog/${encodeURIComponent(id)}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock }),
  });
  const data = await parse<{ product: CatalogProduct }>(res);
  return data.product;
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const PARFUM_SUBS = [
  "for-her",
  "for-him",
  "attars",
  "testers",
  "new-arrivals",
  "limited-edition",
] as const;

export const TECH_SUBS = [
  "chargers",
  "power-banks",
  "earphones",
  "speakers",
  "smartwatches",
  "adapters",
  "lightning-chargers",
  "wires",
  "beauty-care",
  "other-hoco",
] as const;

export type EditorDraft = {
  id: string;
  name: string;
  sku: string;
  category: Category;
  subCategory: string;
  line: string;
  price: number;
  stock: number;
  tag: string;
  short: string;
  description: string;
  status: PublishStatus;
  imagesText: string;
};

export function productToDraft(p: CatalogProduct): EditorDraft {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    subCategory: p.subCategory || (p.category === "tech" ? "chargers" : "for-her"),
    line: p.line,
    price: p.price,
    stock: p.stock,
    tag: p.tag,
    short: p.short,
    description: p.description,
    status: p.status,
    imagesText: (p.images || []).join("\n"),
  };
}

export function blankDraft(category: Category = "parfum"): EditorDraft {
  return {
    id: "",
    name: "",
    sku: "",
    category,
    subCategory: category === "tech" ? "chargers" : "for-her",
    line: category === "tech" ? "Accessories" : "Maison Noir",
    price: 0,
    stock: 25,
    tag: "New",
    short: "",
    description: "",
    status: "published",
    imagesText: "",
  };
}

export function draftToPayload(d: EditorDraft) {
  const id = d.id.trim() || slugify(d.name);
  const images = d.imagesText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id,
    sku: d.sku.trim() || id.toUpperCase(),
    name: d.name.trim(),
    category: d.category,
    subCategory: d.subCategory,
    line: d.line.trim(),
    price: Number(d.price) || 0,
    stock: Math.max(0, Math.floor(Number(d.stock) || 0)),
    tag: d.tag.trim() || "New",
    short: d.short.trim(),
    description: d.description.trim(),
    status: d.status,
    images:
      images.length > 0
        ? images
        : ["https://placehold.co/800x1000/1a1a1a/c89b5c?text=Product"],
    reviews: [] as CatalogProduct["reviews"],
    rating: 4.8,
  };
}
