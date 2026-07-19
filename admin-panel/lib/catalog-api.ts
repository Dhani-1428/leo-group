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

function fileToCompressedDataUrl(
  file: File,
  maxWidth = 1400,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas not supported")
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(objectUrl)
        resolve(canvas.toDataURL("image/jpeg", quality))
      } catch (e) {
        URL.revokeObjectURL(objectUrl)
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Could not read image"))
    }
    img.src = objectUrl
  })
}

/** Upload image to website API; falls back to compressed data URL. */
export async function uploadCatalogImage(file: File): Promise<string> {
  try {
    const body = new FormData()
    body.append("file", file)
    const h: Record<string, string> = {}
    if (ADMIN_KEY) h["X-Admin-Key"] = ADMIN_KEY
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: h,
      body,
    })
    const data = await parse<{ url: string }>(res)
    // Return absolute URL so Next admin can preview images from the website host
    if (data.url.startsWith("http") || data.url.startsWith("data:")) return data.url
    return `${API_BASE}${data.url.startsWith("/") ? "" : "/"}${data.url}`
  } catch {
    return fileToCompressedDataUrl(file)
  }
}

export function resolveImageUrl(src: string) {
  if (!src) return src
  if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src
  }
  return `${API_BASE}${src.startsWith("/") ? "" : "/"}${src}`
}

export function websiteProductUrl(id: string) {
  const site =
    process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "") ||
    "http://localhost:8080"
  return `${site}/product/${id}`
}

export { API_BASE }
