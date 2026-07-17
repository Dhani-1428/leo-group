import type { Product, PublishStatus } from "./products";

export type CatalogProduct = Product & {
  stock: number;
  status: PublishStatus;
  updatedAt: string;
  sku: string;
};
