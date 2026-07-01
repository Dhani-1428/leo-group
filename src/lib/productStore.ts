import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as defaultProducts, type Product, type Review, type Category } from "./products";

type State = {
  products: Product[];
  related: Record<string, string[]>; // productId -> related ids override
};

type Actions = {
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addImage: (id: string, url: string) => void;
  removeImage: (id: string, idx: number) => void;
  addVariant: (id: string, label: string) => void;
  removeVariant: (id: string, idx: number) => void;
  addReview: (id: string, r: Review) => void;
  removeReview: (id: string, idx: number) => void;
  setRelated: (id: string, ids: string[]) => void;
  reset: () => void;
};

export const useProductStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      products: defaultProducts,
      related: {},
      upsertProduct: (p) =>
        set((s) => {
          const i = s.products.findIndex((x) => x.id === p.id);
          const next = [...s.products];
          if (i >= 0) next[i] = p;
          else next.push(p);
          return { products: next };
        }),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      addImage: (id, url) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, images: [...p.images, url] } : p,
          ),
        })),
      removeImage: (id, idx) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, images: p.images.filter((_, i) => i !== idx) } : p,
          ),
        })),
      addVariant: (id, label) =>
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id !== id) return p;
            if (p.category === "parfum") {
              return { ...p, volumes: [...(p.volumes ?? []), label] };
            }
            return { ...p, compatibility: [...(p.compatibility ?? []), label] };
          }),
        })),
      removeVariant: (id, idx) =>
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id !== id) return p;
            if (p.category === "parfum") {
              return { ...p, volumes: (p.volumes ?? []).filter((_, i) => i !== idx) };
            }
            return { ...p, compatibility: (p.compatibility ?? []).filter((_, i) => i !== idx) };
          }),
        })),
      addReview: (id, r) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, reviews: [r, ...p.reviews] } : p,
          ),
        })),
      removeReview: (id, idx) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, reviews: p.reviews.filter((_, i) => i !== idx) } : p,
          ),
        })),
      setRelated: (id, ids) =>
        set((s) => ({ related: { ...s.related, [id]: ids } })),
      reset: () => set({ products: defaultProducts, related: {} }),
    }),
    { name: "aurum.catalog.v1" },
  ),
);

export function newBlankProduct(category: Category): Product {
  const id = `new-${Date.now()}`;
  if (category === "parfum") {
    return {
      id,
      category,
      name: "New Fragrance",
      line: "Maison",
      price: 200,
      tag: "New",
      images: [],
      short: "",
      description: "",
      notes: { top: [], heart: [], base: [] },
      concentration: "Eau de Parfum",
      volumes: ["50ml"],
      perfumer: "",
      ingredients: "",
      rating: 5,
      reviews: [],
    };
  }
  return {
    id,
    category,
    name: "New Accessory",
    line: "Studio",
    price: 199,
    tag: "New",
    images: [],
    short: "",
    description: "",
    specs: {},
    compatibility: [],
    inTheBox: [],
    rating: 5,
    reviews: [],
  };
}
