import { promises as fs } from "node:fs";
import path from "node:path";
import {
  products as seedProducts,
  type Product,
} from "../lib/products";
import type { CatalogProduct } from "../lib/catalogTypes";

export type { CatalogProduct } from "../lib/catalogTypes";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

let cache: CatalogProduct[] | null = null;

function toCatalogProduct(p: Product, overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    ...p,
    stock: overrides.stock ?? p.stock ?? 25,
    status: overrides.status ?? p.status ?? "published",
    updatedAt: overrides.updatedAt ?? p.updatedAt ?? new Date().toISOString(),
    sku: overrides.sku ?? p.sku ?? p.id.toUpperCase().replace(/\s+/g, "-"),
    reviews: p.reviews ?? [],
    rating: p.rating ?? 4.8,
    images: p.images?.length ? p.images : ["/placeholder.svg"],
  };
}

async function ensureDir() {
  await fs.mkdir(path.dirname(CATALOG_PATH), { recursive: true });
}

export async function saveCatalog(products: CatalogProduct[]) {
  cache = products;
  try {
    await ensureDir();
    await fs.writeFile(CATALOG_PATH, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    // Vercel serverless has a read-only filesystem; keep in-memory cache.
    console.warn("[catalog] persistence unavailable, using in-memory catalog:", err);
  }
}

export async function listProducts(opts?: {
  publicOnly?: boolean;
}): Promise<CatalogProduct[]> {
  if (!cache) {
    try {
      const raw = await fs.readFile(CATALOG_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Product[];
      cache = parsed.map((p) => toCatalogProduct(p));
    } catch {
      cache = seedProducts.map((p) => toCatalogProduct(p));
      await saveCatalog(cache);
    }
  }

  if (opts?.publicOnly) {
    return cache.filter((p) => p.status === "published");
  }
  return cache;
}

export async function getProductById(id: string): Promise<CatalogProduct | undefined> {
  const all = await listProducts();
  return all.find((p) => p.id === id);
}

export async function upsertProduct(
  input: Partial<CatalogProduct> & { id: string; name: string; category: Product["category"] },
): Promise<CatalogProduct> {
  const all = await listProducts();
  const existing = all.find((p) => p.id === input.id);
  const next = toCatalogProduct(
    {
      id: input.id,
      category: input.category,
      subCategory: input.subCategory ?? existing?.subCategory,
      name: input.name,
      line: input.line ?? existing?.line ?? "",
      price: Number(input.price ?? existing?.price ?? 0),
      tag: input.tag ?? existing?.tag ?? "New",
      images: input.images ?? existing?.images ?? [],
      short: input.short ?? existing?.short ?? "",
      description: input.description ?? existing?.description ?? "",
      notes: input.notes ?? existing?.notes,
      concentration: input.concentration ?? existing?.concentration,
      volumes: input.volumes ?? existing?.volumes,
      perfumer: input.perfumer ?? existing?.perfumer,
      ingredients: input.ingredients ?? existing?.ingredients,
      specs: input.specs ?? existing?.specs,
      compatibility: input.compatibility ?? existing?.compatibility,
      inTheBox: input.inTheBox ?? existing?.inTheBox,
      reviews: input.reviews ?? existing?.reviews ?? [],
      rating: input.rating ?? existing?.rating ?? 4.8,
    },
    {
      stock: input.stock ?? existing?.stock ?? 25,
      status: input.status ?? existing?.status ?? "published",
      sku: input.sku ?? existing?.sku ?? input.id.toUpperCase(),
      updatedAt: new Date().toISOString(),
    },
  );

  const idx = all.findIndex((p) => p.id === input.id);
  const updated = [...all];
  if (idx >= 0) updated[idx] = next;
  else updated.push(next);
  await saveCatalog(updated);
  return next;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const all = await listProducts();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  await saveCatalog(next);
  return true;
}

export async function setStock(id: string, stock: number): Promise<CatalogProduct | undefined> {
  const all = await listProducts();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return undefined;
  const next = [...all];
  next[idx] = {
    ...next[idx],
    stock: Math.max(0, Math.floor(stock)),
    updatedAt: new Date().toISOString(),
  };
  await saveCatalog(next);
  return next[idx];
}

export function productsByCategory(list: CatalogProduct[], category: Product["category"]) {
  return list.filter((p) => p.category === category);
}

export function getRelated(list: CatalogProduct[], product: CatalogProduct, n = 3) {
  return list.filter((x) => x.category === product.category && x.id !== product.id).slice(0, n);
}
