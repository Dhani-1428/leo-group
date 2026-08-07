import { promises as fs } from "node:fs";
import path from "node:path";
import {
  products as seedProducts,
  type Product,
} from "../lib/products";
import type { CatalogProduct } from "../lib/catalogTypes";
import {
  dbConfigured,
  ensureSchema,
  getPool,
  type RowDataPacket,
} from "@/server/db";

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

function rowToProduct(row: RowDataPacket): CatalogProduct {
  const data =
    typeof row.data === "string"
      ? (JSON.parse(row.data) as CatalogProduct)
      : (row.data as CatalogProduct);
  return toCatalogProduct(data, {
    stock: Number(row.stock),
    status: (row.status as CatalogProduct["status"]) || data.status,
    updatedAt: new Date(row.updated_at).toISOString(),
  });
}

async function ensureDir() {
  await fs.mkdir(path.dirname(CATALOG_PATH), { recursive: true });
}

async function saveCatalogFile(products: CatalogProduct[]) {
  cache = products;
  try {
    await ensureDir();
    await fs.writeFile(CATALOG_PATH, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.warn("[catalog] file persistence unavailable:", err);
  }
}

async function loadCatalogFile(): Promise<CatalogProduct[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Product[];
    cache = parsed.map((p) => toCatalogProduct(p));
  } catch {
    cache = seedProducts.map((p) => toCatalogProduct(p));
    await saveCatalogFile(cache);
  }
  return cache;
}

async function saveCatalogDb(products: CatalogProduct[]) {
  await ensureSchema();
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM catalog_products");
    for (const p of products) {
      await conn.query(
        `INSERT INTO catalog_products (id, category, status, stock, price, name, data, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
        [
          p.id,
          p.category,
          p.status ?? "published",
          p.stock ?? 0,
          p.price,
          p.name,
          JSON.stringify(p),
          new Date(p.updatedAt || Date.now()),
        ],
      );
    }
    await conn.commit();
    cache = products;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function loadCatalogDb(): Promise<CatalogProduct[]> {
  await ensureSchema();
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT * FROM catalog_products ORDER BY name ASC",
  );
  if (!rows.length) {
    const seeded = seedProducts.map((p) => toCatalogProduct(p));
    await saveCatalogDb(seeded);
    return seeded;
  }
  cache = rows.map(rowToProduct);
  return cache;
}

export async function saveCatalog(products: CatalogProduct[]) {
  if (dbConfigured()) {
    try {
      await saveCatalogDb(products);
      return;
    } catch (err) {
      console.warn("[catalog] MySQL save failed, falling back to file:", err);
    }
  }
  await saveCatalogFile(products);
}

export async function listProducts(opts?: {
  publicOnly?: boolean;
}): Promise<CatalogProduct[]> {
  let list: CatalogProduct[];
  if (dbConfigured()) {
    try {
      list = await loadCatalogDb();
    } catch (err) {
      console.warn("[catalog] MySQL list failed, falling back to file:", err);
      list = await loadCatalogFile();
    }
  } else {
    list = await loadCatalogFile();
  }

  if (opts?.publicOnly) {
    return list.filter((p) => p.status === "published");
  }
  return list;
}

export async function getProductById(id: string): Promise<CatalogProduct | undefined> {
  if (dbConfigured()) {
    try {
      await ensureSchema();
      const [rows] = await getPool().query<RowDataPacket[]>(
        "SELECT * FROM catalog_products WHERE id = ? LIMIT 1",
        [id],
      );
      if (rows[0]) return rowToProduct(rows[0]);
      // May still be in seed/file if DB empty for that id
    } catch (err) {
      console.warn("[catalog] MySQL get failed, falling back:", err);
    }
  }
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
      subCategories:
        input.category === "parfum"
          ? (input.subCategories !== undefined ? input.subCategories : existing?.subCategories)
          : undefined,
      genders:
        input.category === "parfum"
          ? (input.genders !== undefined ? input.genders : existing?.genders)
          : undefined,
      availability:
        input.availability !== undefined ? input.availability : existing?.availability,
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

  if (dbConfigured()) {
    try {
      await ensureSchema();
      await getPool().query(
        `INSERT INTO catalog_products (id, category, status, stock, price, name, data, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?)
         ON DUPLICATE KEY UPDATE
           category = VALUES(category),
           status = VALUES(status),
           stock = VALUES(stock),
           price = VALUES(price),
           name = VALUES(name),
           data = VALUES(data),
           updated_at = VALUES(updated_at)`,
        [
          next.id,
          next.category,
          next.status ?? "published",
          next.stock ?? 0,
          next.price,
          next.name,
          JSON.stringify(next),
          new Date(next.updatedAt),
        ],
      );
      cache = null;
      return next;
    } catch (err) {
      console.warn("[catalog] MySQL upsert failed, falling back to file:", err);
    }
  }

  const idx = all.findIndex((p) => p.id === input.id);
  const updated = [...all];
  if (idx >= 0) updated[idx] = next;
  else updated.push(next);
  await saveCatalogFile(updated);
  return next;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (dbConfigured()) {
    try {
      await ensureSchema();
      const [res] = await getPool().query("DELETE FROM catalog_products WHERE id = ?", [id]);
      cache = null;
      const affected = (res as { affectedRows?: number }).affectedRows ?? 0;
      return affected > 0;
    } catch (err) {
      console.warn("[catalog] MySQL delete failed, falling back to file:", err);
    }
  }
  const all = await listProducts();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  await saveCatalogFile(next);
  return true;
}

export async function setStock(id: string, stock: number): Promise<CatalogProduct | undefined> {
  const product = await getProductById(id);
  if (!product) return undefined;
  return upsertProduct({
    ...product,
    stock: Math.max(0, Math.floor(stock)),
  });
}

export function productsByCategory(list: CatalogProduct[], category: Product["category"]) {
  return list.filter((p) => p.category === category);
}

export function getRelated(list: CatalogProduct[], product: CatalogProduct, n = 3) {
  return list.filter((x) => x.category === product.category && x.id !== product.id).slice(0, n);
}
