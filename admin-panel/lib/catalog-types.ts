/** Shared catalog types matching the Leo Group website API. */

export type Category = "parfum" | "tech"

export type PublishStatus = "published" | "draft"

export type FragranceNotes = { top: string[]; heart: string[]; base: string[] }
export type TechSpecs = Record<string, string>
export type Review = {
  name: string
  title: string
  rating: number
  body: string
  date: string
}

export const PERFUME_GENDER_OPTIONS = [
  { key: "women", label: "Women" },
  { key: "men", label: "Men" },
  { key: "unisex", label: "Unisex" },
] as const

export type PerfumeGender = (typeof PERFUME_GENDER_OPTIONS)[number]["key"]

export type CatalogProduct = {
  id: string
  category: Category
  subCategory?: string
  /** Multi audience: men / women / unisex — product shows in each selected shop filter */
  genders?: PerfumeGender[]
  name: string
  line: string
  price: number
  tag: string
  images: string[]
  short: string
  description: string
  notes?: FragranceNotes
  concentration?: string
  volumes?: string[]
  perfumer?: string
  ingredients?: string
  specs?: TechSpecs
  compatibility?: string[]
  inTheBox?: string[]
  reviews: Review[]
  rating: number
  stock: number
  status: PublishStatus
  updatedAt: string
  sku: string
}

export const PARFUM_SUBS = [
  "for-her",
  "for-him",
  "unisex",
  "attars",
  "testers",
  "new-arrivals",
  "limited-edition",
] as const

export const PARFUM_SUB_LABELS: Record<(typeof PARFUM_SUBS)[number], string> = {
  "for-her": "Women",
  "for-him": "Men",
  unisex: "Unisex",
  attars: "Attars",
  testers: "Testers",
  "new-arrivals": "New Arrivals",
  "limited-edition": "Limited Edition",
}

export const CONCENTRATION_OPTIONS = [
  "Eau De Cologne",
  "Eau De Toilette",
  "Eau De Parfum",
  "Pure Parfum",
  "Extrait de Parfum",
] as const

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
] as const

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
