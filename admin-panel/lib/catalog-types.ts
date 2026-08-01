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
  { key: "men", label: "Men", sub: "for-him" },
  { key: "women", label: "Women", sub: "for-her" },
  { key: "unisex", label: "Unisex", sub: "unisex" },
] as const

export type PerfumeGender = (typeof PERFUME_GENDER_OPTIONS)[number]["key"]

export type CatalogProduct = {
  id: string
  category: Category
  subCategory?: string
  /** Extra perfume shop filters (multi). Product appears in each selected filter. */
  subCategories?: string[]
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

/** Clickable perfume sub-categories (multi-select in admin). */
export const PARFUM_SUB_OPTIONS = [
  { value: "for-him", label: "Men" },
  { value: "for-her", label: "Women" },
  { value: "unisex", label: "Unisex" },
  { value: "attars", label: "Attars" },
  { value: "testers", label: "Testers" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "limited-edition", label: "Limited Edition" },
] as const

export const PARFUM_SUBS = PARFUM_SUB_OPTIONS.map((o) => o.value)

export const PARFUM_SUB_LABELS: Record<string, string> = Object.fromEntries(
  PARFUM_SUB_OPTIONS.map((o) => [o.value, o.label]),
)

export const GENDER_FROM_SUB: Record<string, PerfumeGender> = {
  "for-her": "women",
  "for-him": "men",
  unisex: "unisex",
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
