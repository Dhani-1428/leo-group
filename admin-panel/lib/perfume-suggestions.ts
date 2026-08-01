import type { CatalogProduct } from "./catalog-types"

const BRANDS_KEY = "leo.admin.perfumeBrands"
const NAMES_KEY = "leo.admin.perfumeNames"

function readList(key: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : []
  } catch {
    return []
  }
}

function writeList(key: string, values: string[]) {
  if (typeof window === "undefined") return
  const unique = [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  )
  localStorage.setItem(key, JSON.stringify(unique))
}

export function rememberPerfumeBrand(brand: string) {
  const b = brand.trim()
  if (!b) return
  writeList(BRANDS_KEY, [...readList(BRANDS_KEY), b])
}

export function rememberPerfumeName(name: string) {
  const n = name.trim()
  if (!n) return
  writeList(NAMES_KEY, [...readList(NAMES_KEY), n])
}

export function rememberPerfumeIdentity(brand: string, name: string) {
  rememberPerfumeBrand(brand)
  rememberPerfumeName(name)
}

/** Merge catalog perfume lines/names with locally remembered values. */
export function collectPerfumeSuggestions(products: CatalogProduct[]) {
  const fromCatalogBrands = products
    .filter((p) => p.category === "parfum")
    .map((p) => p.line?.trim())
    .filter(Boolean) as string[]
  const fromCatalogNames = products
    .filter((p) => p.category === "parfum")
    .map((p) => p.name?.trim())
    .filter(Boolean) as string[]

  const brands = [
    ...new Set([...fromCatalogBrands, ...readList(BRANDS_KEY)]),
  ].sort((a, b) => a.localeCompare(b))
  const names = [
    ...new Set([...fromCatalogNames, ...readList(NAMES_KEY)]),
  ].sort((a, b) => a.localeCompare(b))

  return { brands, names }
}
