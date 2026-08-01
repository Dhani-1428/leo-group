import type { ParfumSubCategory, PerfumeGender, Product } from "./products";

const SUB_TO_GENDER: Partial<Record<ParfumSubCategory, PerfumeGender>> = {
  "for-her": "women",
  "for-him": "men",
  unisex: "unisex",
};

const GENDER_TO_SUB: Record<PerfumeGender, ParfumSubCategory> = {
  women: "for-her",
  men: "for-him",
  unisex: "unisex",
};

/** All shop filter slugs this perfume belongs to. */
export function productParfumSubs(
  p: Pick<Product, "genders" | "subCategory" | "subCategories">,
): string[] {
  if (p.subCategories && p.subCategories.length > 0) return p.subCategories;

  const fromGenders = (p.genders ?? []).map((g) => GENDER_TO_SUB[g]);
  if (fromGenders.length > 0) {
    const extra =
      p.subCategory && !(p.subCategory in SUB_TO_GENDER) ? [p.subCategory] : [];
    return [...new Set([...fromGenders, ...extra])];
  }

  return p.subCategory ? [p.subCategory] : [];
}

/** Resolve audience tags, with legacy fallback from subCategory. */
export function productGenders(
  p: Pick<Product, "genders" | "subCategory" | "subCategories">,
): PerfumeGender[] {
  if (p.genders && p.genders.length > 0) return p.genders;
  return productParfumSubs(p)
    .map((s) => SUB_TO_GENDER[s as ParfumSubCategory])
    .filter((g): g is PerfumeGender => Boolean(g));
}

/** True if product should appear under a perfume shop / filter slug. */
export function matchesParfumSub(
  p: Pick<Product, "genders" | "subCategory" | "subCategories">,
  sub: string,
): boolean {
  if (sub === "all") return true;
  return productParfumSubs(p).includes(sub);
}
