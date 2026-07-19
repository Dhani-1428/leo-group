import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Plus, Trash2, X, Lock, LogOut, Package, BarChart3, RefreshCw, ExternalLink, Save, Upload, ImagePlus,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { CatalogProduct } from "@/lib/catalogTypes";
import type { Category } from "@/lib/products";
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminSetStock,
  adminUploadImage,
  blankDraft,
  productToDraft,
  draftToPayload,
  PARFUM_SUBS,
  TECH_SUBS,
  type EditorDraft,
} from "@/lib/catalogClient";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — MAISON AURUM" },
      { name: "description", content: "Manage products and stock. Changes go live on the website." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminGate,
});

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
      <div className="min-h-screen bg-obsidian">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 pt-8">
          <Link to="/" className="text-[10px] uppercase tracking-[0.35em] text-white/40 hover:text-amber-200">
            ← Website
          </Link>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(AUTH_KEY);
              setAuthed(false);
            }}
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
    <div className="min-h-screen grid place-items-center bg-obsidian px-6 py-24">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-amber-200/15 bg-black/40 backdrop-blur-xl p-8 shadow-[0_30px_120px_-40px_rgba(0,0,0,0.9)]"
      >
        <div className="mb-6 flex items-center gap-3 text-amber-200">
          <Lock className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.4em]">{t("admin.login.title")}</span>
        </div>
        <h1 className="font-[Cormorant_Garamond] text-4xl text-white mb-2">{t("admin.login.heading")}</h1>
        <p className="text-sm text-white/50 mb-8">{t("admin.login.sub")}</p>
        <p className="mb-6 rounded-md border border-amber-200/20 bg-amber-200/5 px-3 py-2 text-[11px] text-amber-100/70">
          Login: <span className="font-mono text-amber-200">{ADMIN_ID}</span> /{" "}
          <span className="font-mono text-amber-200">{ADMIN_PASSWORD}</span>
        </p>

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

type Tab = "dashboard" | "products" | "stock";

function AdminPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await adminListProducts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3500);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: t("admin.tab.products") },
    { id: "stock", label: "Stock" },
  ];

  const published = products.filter((p) => p.status === "published").length;
  const low = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const out = products.filter((p) => p.stock === 0).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-[Cormorant_Garamond] text-5xl text-amber-200">{t("admin.title")}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/60">
            Changes here go live on the website immediately. Open this panel at{" "}
            <span className="text-amber-200/90">/admin</span> on your live domain.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-amber-200/40 hover:text-amber-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {toast && (
        <div className="mb-6 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {toast}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`-mb-px border-b-2 px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors ${
              tab === x.id
                ? "border-amber-200 text-amber-200"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Products", value: products.length, icon: Package },
            { label: "Published", value: published, icon: ExternalLink },
            { label: "Low stock", value: low, icon: BarChart3 },
            { label: "Out of stock", value: out, icon: BarChart3 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{s.label}</span>
                <s.icon className="h-4 w-4 text-amber-200" />
              </div>
              <div className="font-[Cormorant_Garamond] text-3xl text-white">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <ProductsTab
          products={products}
          loading={loading}
          onReload={load}
          onToast={showToast}
        />
      )}

      {tab === "stock" && (
        <StockTab
          products={products}
          loading={loading}
          onReload={load}
          onToast={showToast}
        />
      )}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">{children}</div>;
}

const input =
  "bg-black/40 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white w-full focus:border-amber-200/50 outline-none";

function ProductsTab({
  products,
  loading,
  onReload,
  onToast,
}: {
  products: CatalogProduct[];
  loading: boolean;
  onReload: () => Promise<void>;
  onToast: (msg: string) => void;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<EditorDraft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”? It will be removed from the live website.`)) return;
    try {
      await adminDeleteProduct(id);
      onToast("Deleted — removed from website");
      await onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleSave(draft: EditorDraft) {
    setSaving(true);
    try {
      const payload = draftToPayload(draft);
      if (!payload.name || !payload.id) throw new Error("Name and id are required");
      if (isNew) await adminCreateProduct(payload);
      else await adminUpdateProduct(draft.id, payload);
      onToast("Saved — live on website");
      setEditing(null);
      await onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setIsNew(true);
            setEditing(blankDraft("parfum"));
          }}
          className="flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-200 hover:bg-amber-200/20"
        >
          <Plus className="h-3.5 w-3.5" /> Add perfume
        </button>
        <button
          type="button"
          onClick={() => {
            setIsNew(true);
            setEditing(blankDraft("tech"));
          }}
          className="flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-200 hover:bg-amber-200/20"
        >
          <Plus className="h-3.5 w-3.5" /> Add tech
        </button>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-white/40">
              <tr className="border-b border-white/10">
                <th className="px-2 py-3 text-left">Product</th>
                <th className="px-2 py-3 text-left">Category</th>
                <th className="px-2 py-3 text-right">Price</th>
                <th className="px-2 py-3 text-right">Stock</th>
                <th className="px-2 py-3 text-left">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-white/40">
                    Loading catalog…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-white/40">
                    No products yet
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="h-12 w-10 object-cover bg-black/40" />
                        )}
                        <div>
                          <div className="text-white">{p.name}</div>
                          <div className="text-xs text-white/40">{p.line}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-white/60">
                      {p.category}
                      {p.subCategory ? ` / ${p.subCategory}` : ""}
                    </td>
                    <td className="px-2 py-3 text-right text-amber-200">€{p.price}</td>
                    <td className="px-2 py-3 text-right text-white/80">{p.stock}</td>
                    <td className="px-2 py-3">
                      <span
                        className={`text-[10px] uppercase tracking-[0.2em] ${
                          p.status === "published" ? "text-emerald-300" : "text-white/40"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="inline-flex items-center gap-3">
                        <Link
                          to="/product/$id"
                          params={{ id: p.id }}
                          className="text-white/50 hover:text-amber-200"
                          title="View on website"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNew(false);
                            setEditing(productToDraft(p));
                          }}
                          className="text-xs text-white/70 hover:text-amber-200"
                        >
                          {t("admin.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(p.id, p.name)}
                          className="text-xs text-red-400/70 hover:text-red-400"
                        >
                          {t("admin.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {editing && (
        <ProductEditor
          draft={editing}
          isNew={isNew}
          saving={saving}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={() => void handleSave(editing)}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">{label}</span>
      {children}
    </label>
  );
}

function ProductEditor({
  draft,
  isNew,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  draft: EditorDraft;
  isNew: boolean;
  saving: boolean;
  onChange: (d: EditorDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  const set = <K extends keyof EditorDraft>(key: K, value: EditorDraft[K]) =>
    onChange({ ...draft, [key]: value });
  const subs = draft.category === "tech" ? TECH_SUBS : PARFUM_SUBS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-6 backdrop-blur-sm">
      <div className="my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-950 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[Cormorant_Garamond] text-2xl text-amber-200">
            {isNew ? "Add product" : t("admin.edit")}
          </h2>
          <button type="button" onClick={onCancel} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.name")}>
            <input className={input} value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="ID / slug">
            <input
              className={`${input} font-mono text-xs`}
              value={draft.id}
              disabled={!isNew}
              onChange={(e) => set("id", e.target.value)}
              placeholder="auto-from-name"
            />
          </Field>
          <Field label={t("admin.line")}>
            <input className={input} value={draft.line} onChange={(e) => set("line", e.target.value)} />
          </Field>
          <Field label="SKU">
            <input className={input} value={draft.sku} onChange={(e) => set("sku", e.target.value)} />
          </Field>
          <Field label={t("admin.category")}>
            <select
              className={input}
              value={draft.category}
              onChange={(e) => {
                const category = e.target.value as Category;
                onChange({
                  ...draft,
                  category,
                  subCategory: category === "tech" ? "chargers" : "for-her",
                });
              }}
            >
              <option value="parfum" className="bg-black">
                Perfume
              </option>
              <option value="tech" className="bg-black">
                Tech
              </option>
            </select>
          </Field>
          <Field label="Sub-category">
            <select
              className={input}
              value={draft.subCategory}
              onChange={(e) => set("subCategory", e.target.value)}
            >
              {subs.map((s) => (
                <option key={s} value={s} className="bg-black">
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("admin.price")}>
            <input
              type="number"
              className={input}
              value={draft.price}
              onChange={(e) => set("price", Number(e.target.value))}
            />
          </Field>
          <Field label="Stock">
            <input
              type="number"
              className={input}
              value={draft.stock}
              onChange={(e) => set("stock", Number(e.target.value))}
            />
          </Field>
          <Field label={t("admin.tag")}>
            <input className={input} value={draft.tag} onChange={(e) => set("tag", e.target.value)} />
          </Field>
          <Field label="Status">
            <select
              className={input}
              value={draft.status}
              onChange={(e) => set("status", e.target.value as EditorDraft["status"])}
            >
              <option value="published" className="bg-black">
                Published (live)
              </option>
              <option value="draft" className="bg-black">
                Draft (hidden)
              </option>
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label={t("admin.short")}>
            <input className={input} value={draft.short} onChange={(e) => set("short", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label={t("admin.description")}>
            <textarea
              rows={4}
              className={input}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Product images">
            <ImageUploader
              images={draft.images}
              onChange={(images) => set("images", images)}
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-white/60 hover:text-white"
          >
            {t("admin.cancel")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="flex items-center gap-2 rounded-full bg-amber-200 px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-black hover:bg-amber-100 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : t("admin.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setError("Please choose image files (JPG, PNG, WebP)");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than 8MB`);
        }
        uploaded.push(await adminUploadImage(file));
      }
      onChange([...images, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...images];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-10 transition-colors ${
          dragOver
            ? "border-amber-200 bg-amber-200/10"
            : "border-white/20 bg-black/30 hover:border-amber-200/50"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <Upload className="h-6 w-6 animate-pulse text-amber-200" />
        ) : (
          <ImagePlus className="h-6 w-6 text-amber-200" />
        )}
        <div className="text-center">
          <div className="text-sm text-white">
            {uploading ? "Uploading…" : "Click to upload or drag & drop"}
          </div>
          <div className="mt-1 text-[11px] text-white/40">JPG, PNG, WebP · max 8MB each</div>
        </div>
      </label>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, i) => (
            <div
              key={`${src.slice(0, 48)}-${i}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-black/40"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-amber-200 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-black">
                  Primary
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="px-2 text-[10px] text-white/80 hover:text-amber-200"
                    disabled={i === 0}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="px-2 text-[10px] text-white/80 hover:text-amber-200"
                    disabled={i === images.length - 1}
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="rounded p-1 text-red-400 hover:bg-red-400/10"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StockTab({
  products,
  loading,
  onReload,
  onToast,
}: {
  products: CatalogProduct[];
  loading: boolean;
  onReload: () => Promise<void>;
  onToast: (msg: string) => void;
}) {
  const [pending, setPending] = useState<Record<string, number>>({});

  async function saveStock(id: string) {
    const value = pending[id];
    if (value === undefined) return;
    try {
      await adminSetStock(id, value);
      onToast("Stock updated — live on website");
      setPending((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
      await onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Stock update failed");
    }
  }

  return (
    <Panel>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-white/40">
            <tr className="border-b border-white/10">
              <th className="px-2 py-3 text-left">Product</th>
              <th className="px-2 py-3 text-left">Category</th>
              <th className="px-2 py-3 text-right">Price</th>
              <th className="px-2 py-3 text-right">Stock</th>
              <th className="px-2 py-3 text-right">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-2 py-8 text-center text-white/40">
                  Loading…
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const qty = pending[p.id] ?? p.stock;
                const dirty = pending[p.id] !== undefined;
                const out = qty <= 0;
                const low = qty > 0 && qty < 10;
                return (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="px-2 py-3 text-white">{p.name}</td>
                    <td className="px-2 py-3 text-white/60">{p.category}</td>
                    <td className="px-2 py-3 text-right text-amber-200">€{p.price}</td>
                    <td className="px-2 py-3 text-right">
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) =>
                          setPending((prev) => ({
                            ...prev,
                            [p.id]: Number(e.target.value),
                          }))
                        }
                        className="w-24 rounded border border-white/10 bg-black/40 px-2 py-1 text-right text-white outline-none focus:border-amber-200/50"
                      />
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span
                        className={`text-xs uppercase tracking-[0.2em] ${
                          out ? "text-red-400" : low ? "text-orange-300" : "text-emerald-300"
                        }`}
                      >
                        {out ? "Out" : low ? "Low" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      {dirty && (
                        <button
                          type="button"
                          onClick={() => void saveStock(p.id)}
                          className="text-xs uppercase tracking-[0.2em] text-amber-200 hover:text-amber-100"
                        >
                          Save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
