import { createContext, useContext, useState, type ReactNode } from "react";

export type Category = "parfum" | "tech";

type Ctx = { category: Category; setCategory: (c: Category) => void };
const CategoryContext = createContext<Ctx | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<Category>("parfum");
  return <CategoryContext.Provider value={{ category, setCategory }}>{children}</CategoryContext.Provider>;
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategory must be used inside CategoryProvider");
  return ctx;
}
