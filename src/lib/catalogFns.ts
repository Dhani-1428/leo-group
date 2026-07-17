import { createServerFn } from "@tanstack/react-start";
import type { CatalogProduct } from "@/lib/catalogTypes";
import type { Category } from "@/lib/products";

export const fetchPublicCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogProduct[]> => {
    const { listProducts } = await import("@/server/catalog");
    return listProducts({ publicOnly: true });
  },
);

export const fetchPublicProduct = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<CatalogProduct | null> => {
    const { getProductById } = await import("@/server/catalog");
    const product = await getProductById(data.id);
    if (!product || product.status !== "published") return null;
    return product;
  });

export const fetchRelatedProducts = createServerFn({ method: "GET" })
  .validator((data: { id: string; n?: number }) => data)
  .handler(async ({ data }): Promise<CatalogProduct[]> => {
    const { listProducts, getRelated, getProductById } = await import("@/server/catalog");
    const product = await getProductById(data.id);
    if (!product || product.status !== "published") return [];
    const all = await listProducts({ publicOnly: true });
    return getRelated(all, product, data.n ?? 3);
  });

export const fetchPublicByCategory = createServerFn({ method: "GET" })
  .validator((data: { category: Category }) => data)
  .handler(async ({ data }): Promise<CatalogProduct[]> => {
    const { listProducts, productsByCategory } = await import("@/server/catalog");
    const all = await listProducts({ publicOnly: true });
    return productsByCategory(all, data.category);
  });
