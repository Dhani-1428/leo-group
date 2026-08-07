import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Minus, Plus, Search, ShoppingBag, Trash2, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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
  const [catalog, setCatalog] = useState(products);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActiveIdx(-1);
    requestAnimationFrame(() => inputRef.current?.focus());
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog?public=1", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data?.products) ? data.products : [];
        if (!cancelled && list.length) setCatalog(list);
      } catch {
        /* keep static products */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const needle = q.trim().toLowerCase();

  const suggestionPool = useMemo(() => {
    const lines = new Set<string>();
    const tags = new Set<string>();
    const names: string[] = [];
    for (const p of catalog) {
      if (p.line) lines.add(p.line);
      if (p.tag) tags.add(p.tag);
      names.push(p.name);
    }
    const categories = [
      { label: "Perfumes", value: "parfum" },
      { label: "Accessories", value: "tech" },
      { label: "Attars", value: "attar" },
      { label: "Testers", value: "tester" },
      { label: "Chargers", value: "charger" },
      { label: "Earbuds", value: "earbud" },
    ];
    return {
      lines: [...lines],
      tags: [...tags],
      names,
      categories,
    };
  }, [catalog]);

  const suggestions = useMemo(() => {
    type Sug = { label: string; value: string; kind: "line" | "tag" | "name" | "category" };
    const out: Sug[] = [];
    const push = (s: Sug) => {
      if (out.some((x) => x.label.toLowerCase() === s.label.toLowerCase())) return;
      out.push(s);
    };

    if (!needle) {
      suggestionPool.categories.forEach((c) =>
        push({ label: c.label, value: c.value, kind: "category" }),
      );
      suggestionPool.lines.slice(0, 6).forEach((line) =>
        push({ label: line, value: line, kind: "line" }),
      );
      suggestionPool.tags.slice(0, 4).forEach((tag) =>
        push({ label: tag, value: tag, kind: "tag" }),
      );
      return out.slice(0, 12);
    }

    for (const c of suggestionPool.categories) {
      if (
        c.label.toLowerCase().includes(needle) ||
        c.value.toLowerCase().includes(needle)
      ) {
        push({ label: c.label, value: c.value, kind: "category" });
      }
    }
    for (const line of suggestionPool.lines) {
      if (line.toLowerCase().includes(needle)) {
        push({ label: line, value: line, kind: "line" });
      }
    }
    for (const tag of suggestionPool.tags) {
      if (tag.toLowerCase().includes(needle)) {
        push({ label: tag, value: tag, kind: "tag" });
      }
    }
    for (const name of suggestionPool.names) {
      if (name.toLowerCase().includes(needle)) {
        push({ label: name, value: name, kind: "name" });
      }
    }
    return out.slice(0, 10);
  }, [needle, suggestionPool]);

  const results = useMemo(() => {
    if (!needle) return catalog.slice(0, 8);
    return catalog
      .filter((p) => {
        const hay = [
          p.name,
          p.line,
          p.tag,
          p.short,
          p.category,
          p.subCategory ?? "",
          ...(p.subCategories ?? []),
          ...(p.genders ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      })
      .slice(0, 12);
  }, [catalog, needle]);

  const applySuggestion = (value: string) => {
    setQ(value);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      applySuggestion(suggestions[activeIdx].value);
    }
  };

  const highlight = (text: string) => {
    if (!needle) return text;
    const idx = text.toLowerCase().indexOf(needle);
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-gold">{text.slice(idx, idx + needle.length)}</span>
        {text.slice(idx + needle.length)}
      </>
    );
  };

  return (
    <PanelShell open={open} onClose={onClose} title={t("panel.search")}>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActiveIdx(-1);
          }}
          onKeyDown={onKeyDown}
          placeholder={t("panel.search.placeholder")}
          className="w-full rounded-full border border-gold/25 bg-obsidian-2/60 py-3 pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/50"
          autoComplete="off"
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-autocomplete="list"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setActiveIdx(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 text-[10px] tracking-[0.3em] text-gold/70">
            {needle ? t("panel.search.suggestions") : t("panel.search.popular")}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={`${s.kind}-${s.label}`}
                type="button"
                onClick={() => applySuggestion(s.value)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`rounded-full border px-3 py-1.5 text-[10px] tracking-[0.2em] transition-colors ${
                  activeIdx === i
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-gold/25 text-foreground/80 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {!needle && (
            <p className="mt-3 text-[11px] text-muted-foreground">{t("panel.search.hint")}</p>
          )}
        </div>
      )}

      <div className="mb-3 text-[10px] tracking-[0.3em] text-gold/70">{t("panel.search.results")}</div>
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
                  <div className="text-[9px] tracking-[0.3em] text-gold/70">
                    {highlight(p.line.toUpperCase())}
                  </div>
                  <div className="mt-1 truncate font-display text-lg">{highlight(p.name)}</div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="text-gold">€{p.price}</span>
                    {p.tag && (
                      <span className="rounded-full border border-gold/20 px-2 py-0.5 text-[9px] tracking-[0.2em] text-muted-foreground">
                        {p.tag}
                      </span>
                    )}
                  </div>
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
  const accountEmail = useBagStore((s) => s.accountEmail);
  const total = items.reduce((n, i) => n + i.price * i.qty, 0);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (open) setCheckoutError("");
  }, [open]);

  const onCheckout = async () => {
    setCheckoutError("");
    setCheckoutBusy(true);
    try {
      const { startCheckout } = await import("@/lib/checkoutClient");
      const url = await startCheckout(items, accountEmail);
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
      setCheckoutBusy(false);
    }
  };

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
            {checkoutError && <p className="text-center text-xs text-red-400">{checkoutError}</p>}
            <button
              type="button"
              disabled={checkoutBusy}
              onClick={onCheckout}
              className="w-full rounded-full bg-gold-gradient py-4 text-[11px] font-semibold tracking-[0.3em] text-obsidian disabled:opacity-50"
            >
              {checkoutBusy ? t("panel.checkout.busy") : t("panel.checkout")}
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
  const accountName = useBagStore((s) => s.accountName);
  const signIn = useBagStore((s) => s.signIn);
  const signOut = useBagStore((s) => s.signOut);

  type Mode = "login" | "register" | "forgot";
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (open) {
      setMode("login");
      setName("");
      setValue("");
      setPassword("");
      setConfirm("");
      setBusy(false);
      setError("");
      setInfo("");
    }
  }, [open]);

  const inputClass =
    "w-full rounded-full border border-gold/25 bg-obsidian-2/60 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/50";

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const { loginAccount } = await import("@/lib/authClient");
      const res = await loginAccount({ email: value, password });
      signIn(res.user.email, res.user.name);
      setInfo(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { registerAccount } = await import("@/lib/authClient");
      const res = await registerAccount({
        email: value,
        password,
        name: name.trim() || undefined,
      });
      signIn(res.user.email, res.user.name);
      setInfo(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const { forgotPassword } = await import("@/lib/authClient");
      const res = await forgotPassword(value);
      setInfo(res.message || t("panel.account.reset.sent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

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
              {accountName && <div className="mt-1 font-display text-xl">{accountName}</div>}
              <div className={`truncate text-sm text-muted-foreground ${accountName ? "mt-0.5" : "mt-1 font-display text-xl text-foreground"}`}>
                {email}
              </div>
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
      ) : mode === "forgot" ? (
        <form className="space-y-5 py-4" onSubmit={onForgot}>
          <p className="text-sm text-muted-foreground">{t("panel.account.reset.copy")}</p>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-gold">{info}</p>}
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
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gold-gradient py-4 text-[11px] font-semibold tracking-[0.3em] text-obsidian disabled:opacity-50"
          >
            {busy ? t("panel.account.busy") : t("panel.account.reset.send")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setInfo("");
            }}
            className="w-full text-center text-[10px] tracking-[0.25em] text-muted-foreground hover:text-gold"
          >
            {t("panel.account.back")}
          </button>
        </form>
      ) : mode === "register" ? (
        <form className="space-y-5 py-4" onSubmit={onRegister}>
          <p className="text-sm text-muted-foreground">{t("panel.account.copy")}</p>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-gold">{info}</p>}
          <div>
            <label className="mb-2 block text-[10px] tracking-[0.3em] text-gold/80">
              {t("panel.account.name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
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
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] tracking-[0.3em] text-gold/80">
              {t("panel.account.password")}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] tracking-[0.3em] text-gold/80">
              {t("panel.account.confirm")}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gold-gradient py-4 text-[11px] font-semibold tracking-[0.3em] text-obsidian disabled:opacity-50"
          >
            {busy ? t("panel.account.busy") : t("panel.account.signup")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setInfo("");
            }}
            className="w-full text-center text-[10px] tracking-[0.25em] text-muted-foreground hover:text-gold"
          >
            {t("panel.account.have")}
          </button>
        </form>
      ) : (
        <form className="space-y-5 py-4" onSubmit={onLogin}>
          <p className="text-sm text-muted-foreground">{t("panel.account.copy")}</p>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-gold">{info}</p>}
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
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] tracking-[0.3em] text-gold/80">
              {t("panel.account.password")}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gold-gradient py-4 text-[11px] font-semibold tracking-[0.3em] text-obsidian disabled:opacity-50"
          >
            {busy ? t("panel.account.busy") : t("panel.account.signin")}
          </button>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError("");
                setInfo("");
              }}
              className="text-center text-[10px] tracking-[0.25em] text-muted-foreground hover:text-gold"
            >
              {t("panel.account.forgot")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setInfo("");
              }}
              className="text-center text-[10px] tracking-[0.25em] text-muted-foreground hover:text-gold"
            >
              {t("panel.account.need")}
            </button>
          </div>
        </form>
      )}
    </PanelShell>
  );
}
