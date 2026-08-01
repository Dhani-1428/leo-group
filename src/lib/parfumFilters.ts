import type { ParfumSubCategory, PerfumeGender, Product } from "./products";

const SUB_TO_GENDER: Partial<Record<ParfumSubCategory, PerfumeGender>> = {
  "for-her": "women",
  "for-him": "men",
  unisex: "unisex",
};

/** Resolve audience tags, with legacy fallback from subCategory. */
export function productGenders(p: Pick<Product, "genders" | "subCategory">): PerfumeGender[] {
  if (p.genders && p.genders.length > 0) return p.genders;
  const fromSub = p.subCategory ? SUB_TO_GENDER[p.subCategory as ParfumSubCategory] : undefined;
  return fromSub ? [fromSub] : [];
}

/** True if product should appear under a perfume shop / filter slug. */
export function matchesParfumSub(
  p: Pick<Product, "genders" | "subCategory">,
  sub: string,
): boolean {
  if (sub === "all") return true;
  const gender = SUB_TO_GENDER[sub as ParfumSubCategory];
  if (gender) {
    return productGenders(p).includes(gender);
  }
  return p.subCategory === sub;
}
