import type { CatalogProduct } from "./catalog-types"

const API_BASE =
  process.env.NEXT_PUBLIC_CATALOG_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080"

const ADMIN_KEY = process.env.NEXT_PUBLIC_CATALOG_ADMIN_KEY || ""

function headers(json = true): HeadersInit {
  const h: Record<string, string> = {}
  if (json) h["Content-Type"] = "application/json"
  if (ADMIN_KEY) h["X-Admin-Key"] = ADMIN_KEY
  return h
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`,
    )
  }
  return data as T
}

export async function listCatalogProducts(): Promise<CatalogProduct[]> {
  const res = await fetch(`${API_BASE}/api/catalog`, {
    headers: headers(false),
    cache: "no-store",
  })
  const data = await parse<{ products: CatalogProduct[] }>(res)
  return data.products
}

export async function getCatalogProduct(id: string): Promise<CatalogProduct> {
  const res = await fetch(`${API_BASE}/api/catalog/${encodeURIComponent(id)}`, {
    headers: headers(false),
    cache: "no-store",
  })
  const data = await parse<{ product: CatalogProduct }>(res)
  return data.product
}

export async function createCatalogProduct(
  product: Partial<CatalogProduct> & {
    id: string
    name: string
    category: CatalogProduct["category"]
  },
): Promise<CatalogProduct> {
  const res = await fetch(`${API_BASE}/api/catalog`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(product),
  })
  const data = await parse<{ product: CatalogProduct; message?: string }>(res)
  return data.product
}

export async function updateCatalogProduct(
  id: string,
  product: Partial<CatalogProduct>,
): Promise<CatalogProduct> {
  const res = await fetch(`${API_BASE}/api/catalog/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(product),
  })
  const data = await parse<{ product: CatalogProduct }>(res)
  return data.product
}

export async function deleteCatalogProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/catalog/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(false),
  })
  await parse<{ ok: boolean }>(res)
}

export async function updateCatalogStock(
  id: string,
  stock: number,
): Promise<CatalogProduct> {
  const res = await fetch(
    `${API_BASE}/api/catalog/${encodeURIComponent(id)}/stock`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ stock }),
    },
  )
  const data = await parse<{ product: CatalogProduct }>(res)
  return data.product
}

export function websiteProductUrl(id: string) {
  const site =
    process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "") ||
    "http://localhost:8080"
  return `${site}/product/${id}`
}

export { API_BASE }
