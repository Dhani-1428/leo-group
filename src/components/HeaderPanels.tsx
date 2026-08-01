import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Minus, Plus, Search, ShoppingBag, Trash2, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useBagStore } from "@/lib/bagStore";
import { products } from "@/lib/products";

export type Panel = "search" | "wishlist" | "account" | "cart" | null;

function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

function PanelShell({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useLockScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-[61] flex w-[90%] max-w-md flex-col border-l border-gold/15 bg-obsidian/98 backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gold/15 px-5">
              <span className="font-display text-sm tracking-[0.3em] text-foreground">{title}</span>
              <button onClick={onClose} aria-label="Close" className="text-foreground/80 hover:text-gold">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="shrink-0 border-t border-gold/15 px-5 py-4">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products.slice(0, 6);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.line.toLowerCase().includes(needle) ||
          p.tag.toLowerCase().includes(needle) ||
          p.short.toLowerCase().includes(needle),
      )
      .slice(0, 12);
  }, [q]);

  return (
    <PanelShell open={open} onClose={onClose} title={t("panel.search")}>
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("panel.search.placeholder")}
          className="w-full rounded-full border border-gold/25 bg-obsidian-2/60 py-3 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/50"
        />
      </div>
      <ul className="space-y-3">
        {results.length === 0 ? (
          <li className="py-10 text-center text-sm text-muted-foreground">{t("panel.search.empty")}</li>
        ) : (
          results.map((p) => (
            <li key={p.id}>
              <Link
                to="/product/$id"
                params={{ id: p.id }}
                onClick={onClose}
                className="flex gap-3 rounded-sm border border-transparent p-2 transition-colors hover:border-gold/20 hover:bg-gold/5"
              >
                <img src={p.images[0]} alt="" className="h-16 w-14 object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] tracking-[0.3em] text-gold/70">{p.line.toUpperCase()}</div>
                  <div className="mt-1 truncate font-display text-lg">{p.name}</div>
                  <div className="mt-1 text-sm text-gold">€{p.price}</div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </PanelShell>
  );
}

export function WishlistPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const wishlist = useBagStore((s) => s.wishlist);
  const removeFromWishlist = useBagStore((s) => s.removeFromWishlist);
  const addToBag = useBagStore((s) => s.addToBag);

  return (
    <PanelShell open={open} onClose={onClose} title={t("panel.wishlist")}>
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Heart className="h-8 w-8 text-gold/40" />
          <p className="text-sm text-muted-foreground">{t("panel.wishlist.empty")}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {wishlist.map((w) => (
            <li key={w.productId} className="flex gap-3 border-b border-gold/10 pb-4">
              <Link to="/product/$id" params={{ id: w.productId }} onClick={onClose}>
                <img src={w.image} alt="" className="h-20 w-16 object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] tracking-[0.3em] text-gold/70">{w.line.toUpperCase()}</div>
                <Link
                  to="/product/$id"
                  params={{ id: w.productId }}
                  onClick={onClose}
                  className="mt-1 block truncate font-display text-lg hover:text-gold"
                >
                  {w.name}
                </Link>
                <div className="mt-1 text-sm text-gold">€{w.price}</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      addToBag({
                        productId: w.productId,
                        name: w.name,
                        line: w.line,
                        price: w.price,
                        image: w.image,
                      });
                    }}
                    className="rounded-full bg-gold-gradient px-3 py-1.5 text-[9px] font-semibold tracking-[0.2em] text-obsidian"
                  >
                    {t("panel.add")}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(w.productId)}
                    className="rounded-full border border-gold/25 px-3 py-1.5 text-[9px] tracking-[0.2em] text-foreground/70 hover:text-gold"
                  >
                    {t("panel.remove")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}

export function CartPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const items = useBagStore((s) => s.items);
  const setQty = useBagStore((s) => s.setQty);
  const removeFromBag = useBagStore((s) => s.removeFromBag);
  const clearBag = useBagStore((s) => s.clearBag);
  const total = items.reduce((n, i) => n + i.price * i.qty, 0);

  return (
    <PanelShell
      open={open}
      onClose={onClose}
      title={t("panel.cart")}
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground">{t("panel.total")}</span>
              <span className="font-display text-2xl text-gold">€{total}</span>
            </div>
            <button
              onClick={() => {
                clearBag();
                onClose();
              }}
              className="w-full rounded-full bg-gold-gradient py-4 text-[11px] font-semibold tracking-[0.3em] text-obsidian"
            >
              {t("panel.checkout")}
            </button>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <ShoppingBag className="h-8 w-8 text-gold/40" />
          <p className="text-sm text-muted-foreground">{t("panel.cart.empty")}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.variant ?? ""}`}
              className="flex gap-3 border-b border-gold/10 pb-4"
            >
              <Link to="/product/$id" params={{ id: item.productId }} onClick={onClose}>
                <img src={item.image} alt="" className="h-20 w-16 object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] tracking-[0.3em] text-gold/70">{item.line.toUpperCase()}</div>
                <Link
                  to="/product/$id"
                  params={{ id: item.productId }}
                  onClick={onClose}
                  className="mt-1 block truncate font-display text-lg hover:text-gold"
                >
                  {item.name}
                </Link>
                {item.variant && (
                  <div className="mt-0.5 text-xs text-muted-foreground">{item.variant}</div>
                )}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-full border border-gold/25">
                    <button
                      onClick={() => setQty(item.productId, item.qty - 1, item.variant)}
                      className="grid h-8 w-8 place-items-center hover:text-gold"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.productId, item.qty + 1, item.variant)}
                      className="grid h-8 w-8 place-items-center hover:text-gold"
                      aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-gold">€{item.price * item.qty}</span>
                    <button
                      onClick={() => removeFromBag(item.productId, item.variant)}
                      aria-label="Remove"
                      className="text-foreground/50 hover:text-gold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}

export function AccountPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const email = useBagStore((s) => s.accountEmail);
  const signIn = useBagStore((s) => s.signIn);
  const signOut = useBagStore((s) => s.signOut);
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setValue("");
      setDone(false);
    }
  }, [open]);

  return (
    <PanelShell open={open} onClose={onClose} title={t("panel.account")}>
      {email ? (
        <div className="space-y-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-gold/10">
              <User className="h-5 w-5 text-gold" />
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] text-gold/70">{t("panel.account.signed")}</div>
              <div className="mt-1 font-display text-xl">{email}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("panel.account.welcome")}</p>
          <button
            onClick={() => signOut()}
            className="w-full rounded-full border border-gold/30 py-4 text-[11px] font-medium tracking-[0.3em] hover:bg-gold/5"
          >
            {t("panel.account.signout")}
          </button>
        </div>
      ) : (
        <form
          className="space-y-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) return;
            signIn(value);
            setDone(true);
          }}
        >
          <p className="text-sm text-muted-foreground">{t("panel.account.copy")}</p>
          <div>
            <label className="mb-2 block text-[10px] tracking-[0.3em] text-gold/80">
              {t("panel.account.email")}
            </label>
            <input
              type="email"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="you@maison.com"
              className="w-full rounded-full border border-gold/25 bg-obsidian-2/60 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/50"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-gold-gradient py-4 text-[11px] font-semibold tracking-[0.3em] text-obsidian"
          >
            {done ? t("panel.account.done") : t("panel.account.signin")}
          </button>
        </form>
      )}
    </PanelShell>
  );
}
