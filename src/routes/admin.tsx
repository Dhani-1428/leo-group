import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X, RotateCcw, Lock, LogOut, Users as UsersIcon, ShoppingBag, Package, BarChart3, TrendingUp, Euro } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useProductStore, newBlankProduct } from "@/lib/productStore";
import type { Product, Category, Review } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — MAISON AURUM" },
      { name: "description", content: "Manage products, images, variants, reviews and related products." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminGate,
});

// Demo-only credentials. Replace with real auth before production.
const ADMIN_ID = "admin@leogroup.com";
const ADMIN_PASSWORD = "LeoAdmin@2026";
const AUTH_KEY = "aurum.admin.auth";

function AdminGate() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  if (authed) {
    return (
      <div>
        <div className="max-w-7xl mx-auto px-6 pt-10 flex justify-end">
          <button
            onClick={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-amber-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> {t("admin.logout")}
          </button>
        </div>
        <AdminPage />
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (id.trim() === ADMIN_ID && pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setErr(false);
    } else {
      setErr(true);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-6 py-24">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-amber-200/15 bg-black/40 backdrop-blur-xl p-8 shadow-[0_30px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="mb-6 flex items-center gap-3 text-amber-200">
          <Lock className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.4em]">{t("admin.login.title")}</span>
        </div>
        <h1 className="font-[Cormorant_Garamond] text-4xl text-white mb-2">{t("admin.login.heading")}</h1>
        <p className="text-sm text-white/50 mb-8">{t("admin.login.sub")}</p>

        <label className="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2">{t("admin.login.id")}</label>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoComplete="username"
          className="w-full mb-5 bg-black/40 border border-white/10 rounded-md px-4 py-3 text-sm text-white focus:border-amber-200/50 outline-none"
        />

        <label className="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2">{t("admin.login.password")}</label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="current-password"
          className="w-full mb-3 bg-black/40 border border-white/10 rounded-md px-4 py-3 text-sm text-white focus:border-amber-200/50 outline-none"
        />

        {err && <p className="text-xs text-red-400 mb-3">{t("admin.login.error")}</p>}

        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-amber-200 text-black text-xs uppercase tracking-[0.3em] py-3 hover:bg-amber-100 transition-colors"
        >
          {t("admin.login.submit")}
        </button>
      </form>
    </div>
  );
}


type Tab = "dashboard" | "products" | "images" | "variants" | "reviews" | "related" | "users" | "orders" | "stock";

function AdminPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("dashboard");
  const products = useProductStore((s) => s.products);
  const reset = useProductStore((s) => s.reset);
  const [selectedId, setSelectedId] = useState<string>(products[0]?.id ?? "");
  const selected = useMemo(() => products.find((p) => p.id === selectedId) ?? products[0], [products, selectedId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: t("admin.tab.products") },
    { id: "stock", label: "Stock" },
    { id: "orders", label: "Orders" },
    { id: "users", label: "Users" },
    { id: "images", label: t("admin.tab.images") },
    { id: "variants", label: t("admin.tab.variants") },
    { id: "reviews", label: t("admin.tab.reviews") },
    { id: "related", label: t("admin.tab.related") },
  ];

  const needsSelected = tab === "images" || tab === "variants" || tab === "reviews" || tab === "related";

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-[Cormorant_Garamond] text-5xl text-amber-200">{t("admin.title")}</h1>
          <p className="text-sm text-white/60 mt-2 max-w-xl">{t("admin.sub")}</p>
        </div>
        <button
          onClick={() => { if (confirm(t("admin.confirm"))) reset(); }}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] border border-white/10 rounded-full px-4 py-2 text-white/70 hover:text-amber-200 hover:border-amber-200/40 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> {t("admin.reset")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 mb-8">
        {tabs.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={`px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors border-b-2 -mb-px ${
              tab === x.id ? "border-amber-200 text-amber-200" : "border-transparent text-white/50 hover:text-white"
            }`}
          >{x.label}</button>
        ))}
      </div>

      {needsSelected && (
        <div className="mb-6">
          <label className="text-xs uppercase tracking-[0.25em] text-white/50 block mb-2">{t("admin.select")}</label>
          <select
            value={selectedId || selected?.id || ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white w-full max-w-md focus:border-amber-200/50 outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id} className="bg-black">{p.name} — {p.line}</option>
            ))}
          </select>
        </div>
      )}

      {tab === "dashboard" && <DashboardTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "stock" && <StockTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "users" && <UsersTab />}
      {tab === "images" && selected && <ImagesTab product={selected} />}
      {tab === "variants" && selected && <VariantsTab product={selected} />}
      {tab === "reviews" && selected && <ReviewsTab product={selected} />}
      {tab === "related" && selected && <RelatedTab product={selected} />}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.25em] text-white/50 block mb-2">{label}</span>
      {children}
    </label>
  );
}

const input = "bg-black/40 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white w-full focus:border-amber-200/50 outline-none";

function ProductsTab() {
  const { t } = useI18n();
  const products = useProductStore((s) => s.products);
  const upsert = useProductStore((s) => s.upsertProduct);
  const del = useProductStore((s) => s.deleteProduct);
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button onClick={() => setEditing(newBlankProduct("parfum"))} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-amber-200/10 border border-amber-200/30 text-amber-200 rounded-full px-4 py-2 hover:bg-amber-200/20 transition-colors">
          <Plus className="w-3.5 h-3.5" /> {t("admin.add")} — {t("nav.parfum")}
        </button>
        <button onClick={() => setEditing(newBlankProduct("tech"))} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-amber-200/10 border border-amber-200/30 text-amber-200 rounded-full px-4 py-2 hover:bg-amber-200/20 transition-colors">
          <Plus className="w-3.5 h-3.5" /> {t("admin.add")} — {t("nav.tech")}
        </button>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-white/40">
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2">{t("admin.name")}</th>
                <th className="text-left py-3 px-2">{t("admin.category")}</th>
                <th className="text-left py-3 px-2">{t("admin.line")}</th>
                <th className="text-right py-3 px-2">{t("admin.price")}</th>
                <th className="text-left py-3 px-2">{t("admin.tag")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-2 text-white">{p.name}</td>
                  <td className="py-3 px-2 text-white/60">{p.category}</td>
                  <td className="py-3 px-2 text-white/60">{p.line}</td>
                  <td className="py-3 px-2 text-right text-amber-200">€{p.price}</td>
                  <td className="py-3 px-2 text-white/60">{p.tag}</td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => setEditing(p)} className="text-xs text-white/70 hover:text-amber-200">{t("admin.edit")}</button>
                      <button onClick={() => { if (confirm(t("admin.confirm"))) del(p.id); }} className="text-xs text-red-400/70 hover:text-red-400">{t("admin.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {editing && (
        <ProductEditor
          product={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => { upsert(p); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ProductEditor({ product, onSave, onCancel }: { product: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<Product>(product);
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl max-w-2xl w-full p-8 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[Cormorant_Garamond] text-2xl text-amber-200">{t("admin.edit")}</h2>
          <button onClick={onCancel} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("admin.name")}><input className={input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <Field label={t("admin.line")}><input className={input} value={draft.line} onChange={(e) => setDraft({ ...draft, line: e.target.value })} /></Field>
          <Field label={t("admin.price")}><input type="number" className={input} value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></Field>
          <Field label={t("admin.tag")}><input className={input} value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} /></Field>
          <Field label={t("admin.category")}>
            <select className={input} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
              <option value="parfum" className="bg-black">Perfume</option>
              <option value="tech" className="bg-black">tech</option>
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label={t("admin.short")}><input className={input} value={draft.short} onChange={(e) => setDraft({ ...draft, short: e.target.value })} /></Field>
        </div>
        <div className="mt-4">
          <Field label={t("admin.description")}><textarea rows={4} className={input} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onCancel} className="text-xs uppercase tracking-[0.25em] px-5 py-2.5 text-white/60 hover:text-white">{t("admin.cancel")}</button>
          <button onClick={() => onSave(draft)} className="text-xs uppercase tracking-[0.25em] px-5 py-2.5 bg-amber-200 text-black rounded-full hover:bg-amber-100">{t("admin.save")}</button>
        </div>
      </div>
    </div>
  );
}

function ImagesTab({ product }: { product: Product }) {
  const { t } = useI18n();
  const add = useProductStore((s) => s.addImage);
  const rem = useProductStore((s) => s.removeImage);
  const [url, setUrl] = useState("");
  return (
    <Panel>
      <div className="flex gap-3 mb-6">
        <input className={input} placeholder={t("admin.url")} value={url} onChange={(e) => setUrl(e.target.value)} />
        <button onClick={() => { if (url) { add(product.id, url); setUrl(""); } }} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-amber-200 text-black rounded-full px-5 hover:bg-amber-100">
          <Plus className="w-3.5 h-3.5" /> {t("admin.add")}
        </button>
      </div>
      {product.images.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-8">{t("admin.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.images.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button onClick={() => rem(product.id, i)} className="absolute top-2 right-2 bg-black/70 text-red-400 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function VariantsTab({ product }: { product: Product }) {
  const { t } = useI18n();
  const add = useProductStore((s) => s.addVariant);
  const rem = useProductStore((s) => s.removeVariant);
  const [val, setVal] = useState("");
  const list = product.category === "parfum" ? (product.volumes ?? []) : (product.compatibility ?? []);
  return (
    <Panel>
      <div className="flex gap-3 mb-6">
        <input className={input} placeholder={t("admin.variant.label")} value={val} onChange={(e) => setVal(e.target.value)} />
        <button onClick={() => { if (val) { add(product.id, val); setVal(""); } }} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-amber-200 text-black rounded-full px-5 hover:bg-amber-100">
          <Plus className="w-3.5 h-3.5" /> {t("admin.add")}
        </button>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-8">{t("admin.empty")}</p>
      ) : (
        <ul className="space-y-2">
          {list.map((v, i) => (
            <li key={i} className="flex items-center justify-between border border-white/10 rounded-lg px-4 py-3">
              <span className="text-sm text-white">{v}</span>
              <button onClick={() => rem(product.id, i)} className="text-red-400/70 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ReviewsTab({ product }: { product: Product }) {
  const { t } = useI18n();
  const add = useProductStore((s) => s.addReview);
  const rem = useProductStore((s) => s.removeReview);
  const [draft, setDraft] = useState<Review>({ name: "", title: "", rating: 5, body: "", date: "Just now" });
  return (
    <div className="space-y-6">
      <Panel>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("admin.review.name")}><input className={input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <Field label={t("admin.review.title")}><input className={input} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
          <Field label={t("admin.review.rating")}>
            <input type="number" min={1} max={5} step={0.1} className={input} value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label={t("admin.review.body")}><textarea rows={3} className={input} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /></Field>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={() => { if (draft.name && draft.body) { add(product.id, draft); setDraft({ name: "", title: "", rating: 5, body: "", date: "Just now" }); } }} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-amber-200 text-black rounded-full px-5 py-2.5 hover:bg-amber-100">
            <Plus className="w-3.5 h-3.5" /> {t("admin.add")}
          </button>
        </div>
      </Panel>
      <Panel>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">{t("admin.empty")}</p>
        ) : (
          <ul className="space-y-4">
            {product.reviews.map((r, i) => (
              <li key={i} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-amber-200">{r.name}</div>
                    <div className="text-xs text-white/40">{r.title} · {r.date} · ★ {r.rating}</div>
                  </div>
                  <button onClick={() => rem(product.id, i)} className="text-red-400/70 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function RelatedTab({ product }: { product: Product }) {
  const { t } = useI18n();
  const products = useProductStore((s) => s.products);
  const related = useProductStore((s) => s.related);
  const setRel = useProductStore((s) => s.setRelated);
  const current = related[product.id] ?? [];
  const toggle = (id: string) => {
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setRel(product.id, next);
  };
  return (
    <Panel>
      <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-4">{t("admin.tab.related")}</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {products.filter((p) => p.id !== product.id).map((p) => {
          const on = current.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`text-left border rounded-lg p-3 transition-colors ${on ? "border-amber-200 bg-amber-200/10" : "border-white/10 hover:border-white/30"}`}
            >
              <div className={`text-sm ${on ? "text-amber-200" : "text-white"}`}>{p.name}</div>
              <div className="text-xs text-white/40">{p.category} · {p.line}</div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

// ============ Dashboard / Users / Orders / Stock ============

const STOCK_KEY = "aurum.admin.stock";
const USERS_KEY = "aurum.admin.users";
const ORDERS_KEY = "aurum.admin.orders";

function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

type StockMap = Record<string, number>;
type UserRow = { id: string; name: string; email: string; role: "customer" | "admin"; joined: string; status: "active" | "blocked" };
type OrderRow = { id: string; customer: string; email: string; total: number; status: "pending" | "shipped" | "delivered" | "cancelled"; date: string; items: number };

const seedUsers: UserRow[] = [
  { id: "U-1001", name: "Sofia Martins", email: "sofia@example.com", role: "customer", joined: "2026-05-12", status: "active" },
  { id: "U-1002", name: "João Silva", email: "joao@example.com", role: "customer", joined: "2026-05-18", status: "active" },
  { id: "U-1003", name: "Aisha Khan", email: "aisha@example.com", role: "customer", joined: "2026-06-01", status: "active" },
  { id: "U-1004", name: "Marco Rossi", email: "marco@example.com", role: "customer", joined: "2026-06-11", status: "blocked" },
  { id: "U-1005", name: "Leo Admin", email: "admin@leogroup.com", role: "admin", joined: "2026-01-01", status: "active" },
];

const seedOrders: OrderRow[] = [
  { id: "ORD-3001", customer: "Sofia Martins", email: "sofia@example.com", total: 189, status: "delivered", date: "2026-06-20", items: 2 },
  { id: "ORD-3002", customer: "João Silva", email: "joao@example.com", total: 74, status: "shipped", date: "2026-06-24", items: 1 },
  { id: "ORD-3003", customer: "Aisha Khan", email: "aisha@example.com", total: 312, status: "pending", date: "2026-06-28", items: 3 },
  { id: "ORD-3004", customer: "Marco Rossi", email: "marco@example.com", total: 55, status: "cancelled", date: "2026-06-29", items: 1 },
  { id: "ORD-3005", customer: "Sofia Martins", email: "sofia@example.com", total: 128, status: "pending", date: "2026-06-30", items: 2 },
];

function DashboardTab() {
  const products = useProductStore((s) => s.products);
  const [orders] = useLocalState<OrderRow[]>(ORDERS_KEY, seedOrders);
  const [users] = useLocalState<UserRow[]>(USERS_KEY, seedUsers);
  const [stock] = useLocalState<StockMap>(STOCK_KEY, {});

  const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === "pending").length;
  const lowStock = products.filter(p => (stock[p.id] ?? 25) < 10).length;

  const stats = [
    { label: "Revenue", value: `€${revenue.toLocaleString()}`, icon: Euro, tone: "text-amber-200" },
    { label: "Orders", value: orders.length, icon: ShoppingBag, tone: "text-white" },
    { label: "Pending", value: pending, icon: TrendingUp, tone: "text-orange-300" },
    { label: "Users", value: users.length, icon: UsersIcon, tone: "text-white" },
    { label: "Products", value: products.length, icon: Package, tone: "text-white" },
    { label: "Low Stock", value: lowStock, icon: BarChart3, tone: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.tone}`} />
            </div>
            <div className={`text-2xl font-[Cormorant_Garamond] ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <Panel>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-[0.25em] text-white/70">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-white/40">
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-2">Order</th>
                <th className="text-left py-2 px-2">Customer</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-white/5">
                  <td className="py-2 px-2 text-amber-200">{o.id}</td>
                  <td className="py-2 px-2 text-white/80">{o.customer}</td>
                  <td className="py-2 px-2 text-white/60 capitalize">{o.status}</td>
                  <td className="py-2 px-2 text-right text-white">€{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function StockTab() {
  const products = useProductStore((s) => s.products);
  const [stock, setStock] = useLocalState<StockMap>(STOCK_KEY, {});
  return (
    <Panel>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-white/40">
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2">Product</th>
              <th className="text-left py-3 px-2">Category</th>
              <th className="text-right py-3 px-2">Price</th>
              <th className="text-right py-3 px-2">Stock</th>
              <th className="text-right py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const qty = stock[p.id] ?? 25;
              const low = qty < 10;
              const out = qty <= 0;
              return (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="py-3 px-2 text-white">{p.name}</td>
                  <td className="py-3 px-2 text-white/60">{p.category}</td>
                  <td className="py-3 px-2 text-right text-amber-200">€{p.price}</td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setStock({ ...stock, [p.id]: Number(e.target.value) })}
                      className="w-24 bg-black/40 border border-white/10 rounded px-2 py-1 text-right text-white focus:border-amber-200/50 outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`text-xs uppercase tracking-[0.2em] ${out ? "text-red-400" : low ? "text-orange-300" : "text-emerald-300"}`}>
                      {out ? "Out" : low ? "Low" : "In Stock"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useLocalState<OrderRow[]>(ORDERS_KEY, seedOrders);
  const setStatus = (id: string, status: OrderRow["status"]) =>
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  const remove = (id: string) => { if (confirm("Delete order?")) setOrders(orders.filter((o) => o.id !== id)); };

  return (
    <Panel>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-white/40">
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2">Order ID</th>
              <th className="text-left py-3 px-2">Customer</th>
              <th className="text-left py-3 px-2">Date</th>
              <th className="text-right py-3 px-2">Items</th>
              <th className="text-right py-3 px-2">Total</th>
              <th className="text-left py-3 px-2">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5">
                <td className="py-3 px-2 text-amber-200">{o.id}</td>
                <td className="py-3 px-2 text-white/80">
                  <div>{o.customer}</div>
                  <div className="text-xs text-white/40">{o.email}</div>
                </td>
                <td className="py-3 px-2 text-white/60">{o.date}</td>
                <td className="py-3 px-2 text-right text-white/60">{o.items}</td>
                <td className="py-3 px-2 text-right text-white">€{o.total}</td>
                <td className="py-3 px-2">
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value as OrderRow["status"])}
                    className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-amber-200/50 outline-none"
                  >
                    <option value="pending" className="bg-black">Pending</option>
                    <option value="shipped" className="bg-black">Shipped</option>
                    <option value="delivered" className="bg-black">Delivered</option>
                    <option value="cancelled" className="bg-black">Cancelled</option>
                  </select>
                </td>
                <td className="py-3 px-2 text-right">
                  <button onClick={() => remove(o.id)} className="text-red-400/70 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function UsersTab() {
  const [users, setUsers] = useLocalState<UserRow[]>(USERS_KEY, seedUsers);
  const toggleStatus = (id: string) =>
    setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "blocked" : "active" } : u)));
  const remove = (id: string) => { if (confirm("Delete user?")) setUsers(users.filter((u) => u.id !== id)); };

  return (
    <Panel>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-white/40">
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2">User</th>
              <th className="text-left py-3 px-2">Email</th>
              <th className="text-left py-3 px-2">Role</th>
              <th className="text-left py-3 px-2">Joined</th>
              <th className="text-left py-3 px-2">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="py-3 px-2 text-white">{u.name}</td>
                <td className="py-3 px-2 text-white/60">{u.email}</td>
                <td className="py-3 px-2 text-white/60 capitalize">{u.role}</td>
                <td className="py-3 px-2 text-white/60">{u.joined}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs uppercase tracking-[0.2em] ${u.status === "active" ? "text-emerald-300" : "text-red-400"}`}>{u.status}</span>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="inline-flex gap-3">
                    <button onClick={() => toggleStatus(u.id)} className="text-xs text-white/70 hover:text-amber-200">
                      {u.status === "active" ? "Block" : "Unblock"}
                    </button>
                    <button onClick={() => remove(u.id)} className="text-red-400/70 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
