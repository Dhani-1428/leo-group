import type { BagItem } from "@/lib/bagStore";
import { useBagStore } from "@/lib/bagStore";
import { startCheckout } from "@/lib/checkoutClient";

export type CartProductInput = {
  productId: string;
  name: string;
  line: string;
  price: number;
  image: string;
  variant?: string;
  qty?: number;
};

/** Add to bag (opens cart via cartOpenNonce). */
export function addProductToBag(input: CartProductInput) {
  useBagStore.getState().addToBag(input, { openCart: true });
}

/** Add item then redirect straight to Stripe Checkout. */
export async function buyProductNow(input: CartProductInput) {
  const store = useBagStore.getState();
  store.addToBag(input, { openCart: false });

  const qty = Math.max(1, input.qty ?? 1);
  const line: BagItem = {
    productId: input.productId,
    name: input.name,
    line: input.line,
    price: input.price,
    image: input.image,
    variant: input.variant,
    qty,
  };

  const url = await startCheckout([line], store.accountEmail);
  window.location.href = url;
}
