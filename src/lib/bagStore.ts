import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BagItem = {
  productId: string;
  name: string;
  line: string;
  price: number;
  image: string;
  variant?: string;
  qty: number;
};

export type WishItem = {
  productId: string;
  name: string;
  line: string;
  price: number;
  image: string;
};

type AddInput = {
  productId: string;
  name: string;
  line: string;
  price: number;
  image: string;
  variant?: string;
  qty?: number;
};

type State = {
  items: BagItem[];
  wishlist: WishItem[];
  accountEmail: string | null;
};

type Actions = {
  addToBag: (item: AddInput) => void;
  removeFromBag: (productId: string, variant?: string) => void;
  setQty: (productId: string, qty: number, variant?: string) => void;
  clearBag: () => void;
  toggleWishlist: (item: WishItem) => void;
  isWished: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  signIn: (email: string) => void;
  signOut: () => void;
  bagCount: () => number;
  bagTotal: () => number;
};

function sameLine(a: BagItem, productId: string, variant?: string) {
  return a.productId === productId && (a.variant ?? "") === (variant ?? "");
}

export const useBagStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      accountEmail: null,

      addToBag: (item) =>
        set((s) => {
          const qty = Math.max(1, item.qty ?? 1);
          const i = s.items.findIndex((x) => sameLine(x, item.productId, item.variant));
          if (i >= 0) {
            const next = [...s.items];
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return { items: next };
          }
          return {
            items: [
              ...s.items,
              {
                productId: item.productId,
                name: item.name,
                line: item.line,
                price: item.price,
                image: item.image,
                variant: item.variant,
                qty,
              },
            ],
          };
        }),

      removeFromBag: (productId, variant) =>
        set((s) => ({
          items: s.items.filter((x) => !sameLine(x, productId, variant)),
        })),

      setQty: (productId, qty, variant) =>
        set((s) => {
          if (qty <= 0) {
            return { items: s.items.filter((x) => !sameLine(x, productId, variant)) };
          }
          return {
            items: s.items.map((x) =>
              sameLine(x, productId, variant) ? { ...x, qty } : x,
            ),
          };
        }),

      clearBag: () => set({ items: [] }),

      toggleWishlist: (item) =>
        set((s) => {
          const exists = s.wishlist.some((w) => w.productId === item.productId);
          if (exists) {
            return { wishlist: s.wishlist.filter((w) => w.productId !== item.productId) };
          }
          return { wishlist: [...s.wishlist, item] };
        }),

      isWished: (productId) => get().wishlist.some((w) => w.productId === productId),

      removeFromWishlist: (productId) =>
        set((s) => ({
          wishlist: s.wishlist.filter((w) => w.productId !== productId),
        })),

      signIn: (email) => set({ accountEmail: email.trim() || null }),
      signOut: () => set({ accountEmail: null }),

      bagCount: () => get().items.reduce((n, i) => n + i.qty, 0),
      bagTotal: () => get().items.reduce((n, i) => n + i.price * i.qty, 0),
    }),
    { name: "leo.bag.v1" },
  ),
);
