import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Heart, ShoppingBag, Star, Truck, Shield, RotateCcw,
  Plus, Minus, Check, ArrowUpRight, Sparkles,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { fetchPublicProduct, fetchRelatedProducts } from "@/lib/catalogFns";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await fetchPublicProduct({ data: { id: params.id } });
    if (!product) throw notFound();
    const related = await fetchRelatedProducts({ data: { id: params.id, n: 3 } });
    return { product, related };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — ${p.line} | MAISON AURUM` : "MAISON AURUM";
    const desc = p?.short ?? "MAISON AURUM";
    const img = p?.images[0];
    const inStock = (p?.stock ?? 1) > 0;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        ...(img ? [{ property: "og:image", content: img }] : []),
      ],
      links: p ? [{ rel: "canonical", href: `/product/${p.id}` }] : [],
      scripts: p
        ? [{
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.name,
              description: p.short,
              brand: { "@type": "Brand", name: "MAISON AURUM" },
              offers: {
                "@type": "Offer",
                priceCurrency: "EUR",
                price: p.price,
                availability: inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: p.rating,
                reviewCount: p.reviews.length,
              },
            }),
          }]
        : [],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <div className="font-display text-5xl text-gold-gradient">Not found</div>
        <p className="mt-3 text-sm text-muted-foreground">This object has slipped from the catalog.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 px-6 py-3 text-xs tracking-[0.3em] hover:bg-gold/5">
          ← RETURN
        </Link>
      </div>
    </div>
  ),
});

/* ---------- Image gallery with magnifier zoom ---------- */
function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:gap-6">
      {/* thumbnails */}
      <div className="flex shrink-0 gap-3 lg:flex-col">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            data-cursor
            className={`relative aspect-square w-20 overflow-hidden rounded-sm border transition-all ${
              active === i ? "border-gold gold-border-glow" : "border-gold/15 opacity-60 hover:opacity-100"
            }`}
          >
            <img src={src} alt="" loading="lazy" width={120} height={120} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* main image */}
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setZoomPos(null)}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-gold/15 bg-obsidian-2"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={alt}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full object-cover"
            width={800}
            height={1000}
          />
        </AnimatePresence>

        {/* magnifier */}
        {zoomPos && (
          <div
            className="pointer-events-none absolute hidden h-48 w-48 rounded-full border border-gold/40 shadow-[0_0_40px_oklch(0_0_0/0.6)] md:block"
            style={{
              left: `calc(${zoomPos.x}% - 6rem)`,
              top: `calc(${zoomPos.y}% - 6rem)`,
              backgroundImage: `url(${images[active]})`,
              backgroundSize: "260%",
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}

        {/* badge */}
        <div className="absolute left-4 top-4 rounded-full border border-gold/30 bg-obsidian/60 px-3 py-1 text-[9px] tracking-[0.3em] text-gold backdrop-blur">
          HOVER TO ZOOM
        </div>
      </div>
    </div>
  );
}

/* ---------- Star rating ---------- */
function Stars({ rating, size = 3.5 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`fill-gold/${i < Math.round(rating) ? 100 : 20}`}
          style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
          fill={i < Math.round(rating) ? "currentColor" : "transparent"}
          strokeWidth={1}
        />
      ))}
    </div>
  );
}

/* ---------- Notes pyramid ---------- */
function NotesPyramid({ p }: { p: Product }) {
  if (!p.notes) return null;
  const tiers = [
    { label: "Top notes", items: p.notes.top, depth: "100%" },
    { label: "Heart notes", items: p.notes.heart, depth: "75%" },
    { label: "Base notes", items: p.notes.base, depth: "55%" },
  ];
  return (
    <div className="space-y-6">
      {tiers.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="mx-auto"
          style={{ width: t.depth }}
        >
          <div className="glass-panel rounded-sm px-6 py-5 text-center">
            <div className="mb-3 text-[10px] tracking-[0.4em] text-gold/80">{t.label.toUpperCase()}</div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-display text-lg">
              {t.items.map((n, k) => (
                <span key={n}>
                  {n}
                  {k < t.items.length - 1 && <span className="ml-4 text-gold/40">·</span>}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- Tabs ---------- */
function Tabs({ p }: { p: Product }) {
  const isParfum = p.category === "parfum";
  const tabs = useMemo(() => {
    if (isParfum) {
      return [
        { id: "notes", label: "Fragrance notes" },
        { id: "details", label: "Composition" },
        { id: "ingredients", label: "Ingredients" },
      ] as const;
    }
    return [
      { id: "specs", label: "Specifications" },
      { id: "compat", label: "Compatibility" },
      { id: "box", label: "In the box" },
    ] as const;
  }, [isParfum]);

  const [active, setActive] = useState<string>(tabs[0].id);

  return (
    <section className="border-t border-gold/10 bg-obsidian-2 py-24">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-4xl md:text-6xl">The <span className="italic text-gold-gradient">composition</span>.</h2>
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                data-cursor
                className={`rounded-full border px-5 py-2.5 text-[10px] tracking-[0.3em] transition-all ${
                  active === t.id ? "border-gold bg-gold-gradient text-obsidian" : "border-gold/20 text-foreground/70 hover:border-gold/50"
                }`}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {active === "notes" && <NotesPyramid p={p} />}

              {active === "details" && (
                <div className="grid gap-8 md:grid-cols-3">
                  {[
                    { k: "Concentration", v: p.concentration },
                    { k: "Volumes", v: p.volumes?.join(" · ") },
                    { k: "Perfumer", v: p.perfumer },
                  ].map((row) => (
                    <div key={row.k} className="border-t border-gold/15 pt-5">
                      <div className="text-[10px] tracking-[0.3em] text-gold/70">{row.k.toUpperCase()}</div>
                      <div className="mt-2 font-display text-2xl">{row.v}</div>
                    </div>
                  ))}
                  <p className="md:col-span-3 max-w-3xl text-muted-foreground">{p.description}</p>
                </div>
              )}

              {active === "ingredients" && (
                <div className="max-w-3xl">
                  <p className="font-display text-lg text-muted-foreground leading-relaxed">{p.ingredients}</p>
                  <p className="mt-6 text-sm text-muted-foreground/80">
                    Crafted in compliance with IFRA standards. Composed in Grasse, France.
                  </p>
                </div>
              )}

              {active === "specs" && p.specs && (
                <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                  {Object.entries(p.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-b border-gold/10 pb-4">
                      <div className="text-[11px] tracking-[0.25em] text-gold/80">{k.toUpperCase()}</div>
                      <div className="text-right text-sm text-foreground/90">{v}</div>
                    </div>
                  ))}
                </div>
              )}

              {active === "compat" && p.compatibility && (
                <div className="grid gap-4 md:grid-cols-2">
                  {p.compatibility.map((c) => (
                    <div key={c} className="glass-panel flex items-center gap-4 rounded-sm p-5">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-gradient text-obsidian">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </div>
                      <div className="font-display text-lg">{c}</div>
                    </div>
                  ))}
                </div>
              )}

              {active === "box" && p.inTheBox && (
                <ul className="grid gap-3 md:grid-cols-2">
                  {p.inTheBox.map((i) => (
                    <li key={i} className="flex items-center gap-4 border-b border-gold/10 py-4">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <span className="font-display text-lg">{i}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------- Reviews ---------- */
function Reviews({ p }: { p: Product }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 text-[10px] tracking-[0.5em] text-gold/70">— VOICES</div>
            <h2 className="font-display text-4xl md:text-6xl">
              {p.rating.toFixed(1)} <span className="italic text-gold-gradient">/ 5</span>
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <Stars rating={p.rating} />
              <span className="text-sm text-muted-foreground">{p.reviews.length} verified reviews</span>
            </div>
          </div>
          <button className="rounded-full border border-gold/30 px-6 py-3 text-[10px] tracking-[0.3em] hover:bg-gold/5" data-cursor>
            WRITE A REVIEW
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {p.reviews.map((r, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-panel rounded-sm p-8"
            >
              <Stars rating={r.rating} />
              <p className="mt-5 font-display text-xl leading-snug text-foreground/90">"{r.body}"</p>
              <div className="mt-6 border-t border-gold/15 pt-4">
                <div className="text-sm font-medium">{r.name}</div>
                <div className="mt-1 text-[10px] tracking-[0.3em] text-muted-foreground">
                  {r.title.toUpperCase()} · {r.date.toUpperCase()}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Related ---------- */
function Related({ items }: { items: Product[] }) {
  return (
    <section className="border-t border-gold/10 bg-obsidian-2 py-24">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mb-3 text-[10px] tracking-[0.5em] text-gold/70">— ALSO IN THIS HOUSE</div>
            <h2 className="font-display text-4xl md:text-6xl">You may <span className="italic">desire</span>.</h2>
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Link to="/product/$id" params={{ id: r.id }} className="group block" data-cursor>
                <div className="relative aspect-[4/5] overflow-hidden bg-obsidian">
                  <img src={r.images[0]} alt={r.name} loading="lazy" width={800} height={1000}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient py-3 text-[10px] font-semibold tracking-[0.3em] text-obsidian">
                      DISCOVER <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] tracking-[0.3em] text-gold/70">{r.line.toUpperCase()}</div>
                    <h3 className="mt-1 font-display text-2xl">{r.name}</h3>
                  </div>
                  <div className="font-display text-xl text-gold">€{r.price}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
function ProductPage() {
  const { product: p, related } = Route.useLoaderData();
  const isParfum = p.category === "parfum";
  const inStock = (p.stock ?? 1) > 0;
  const lowStock = inStock && (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10;

  const [variant, setVariant] = useState<string>(isParfum ? p.volumes?.[1] ?? "" : "");
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    if (!inStock) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main className="min-h-screen bg-background pt-28 lg:pt-32">
      {/* Breadcrumbs */}
      <nav className="mx-auto max-w-[1500px] px-6 pb-8 text-[11px] tracking-[0.25em] text-muted-foreground lg:px-12">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link to="/" className="hover:text-gold">HOME</Link></li>
          <li><ChevronRight className="h-3 w-3 text-gold/40" /></li>
          <li className="hover:text-gold">{isParfum ? "MAISON DE PERFUME" : "STUDIO TECH"}</li>
          <li><ChevronRight className="h-3 w-3 text-gold/40" /></li>
          <li className="text-gold">{p.name.toUpperCase()}</li>
        </ol>
      </nav>

      {/* Main */}
      <section className="mx-auto grid max-w-[1500px] gap-12 px-6 pb-20 lg:grid-cols-2 lg:gap-20 lg:px-12">
        <Gallery images={p.images} alt={p.name} />

        <div className="lg:sticky lg:top-32 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[10px] tracking-[0.4em] text-gold/80">
              {p.line.toUpperCase()} · {p.tag.toUpperCase()}
            </div>
            <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
              {p.name}
            </h1>
            <div className="mt-5 flex items-center gap-4">
              <Stars rating={p.rating} />
              <span className="text-sm text-muted-foreground">
                {p.rating.toFixed(1)} · {p.reviews.length} reviews
              </span>
            </div>

            <p className="mt-8 max-w-md font-display text-xl leading-snug text-muted-foreground">
              {p.short}
            </p>

            <div className="mt-10 flex items-baseline gap-3">
              <div className="font-display text-4xl text-gold-gradient">€{p.price * qty}</div>
              <div className="text-xs tracking-[0.2em] text-muted-foreground">EUR · Tax included</div>
            </div>

            {!inStock ? (
              <div className="mt-4 text-[10px] tracking-[0.35em] text-red-400">OUT OF STOCK</div>
            ) : lowStock ? (
              <div className="mt-4 text-[10px] tracking-[0.35em] text-amber-300/90">
                LOW STOCK · {p.stock} LEFT
              </div>
            ) : null}

            {/* Variants */}
            {isParfum && p.volumes && (
              <div className="mt-10">
                <div className="mb-4 text-[10px] tracking-[0.4em] text-gold/80">SELECT VOLUME</div>
                <div className="flex flex-wrap gap-3">
                  {p.volumes.map((v: string) => (
                    <button
                      key={v}
                      onClick={() => setVariant(v)}
                      data-cursor
                      className={`rounded-sm border px-6 py-3 text-sm font-medium transition-all ${
                        variant === v
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-gold/20 text-foreground/70 hover:border-gold/50"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-10 flex items-center gap-4">
              <div className="text-[10px] tracking-[0.4em] text-gold/80">QUANTITY</div>
              <div className="inline-flex items-center rounded-full border border-gold/25">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center hover:text-gold" data-cursor>
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[2rem] text-center font-display text-lg">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="grid h-11 w-11 place-items-center hover:text-gold" data-cursor>
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={addToCart}
                  disabled={!inStock}
                  data-cursor
                  className="group relative flex-1 overflow-hidden rounded-full bg-gold-gradient py-5 text-xs font-semibold tracking-[0.3em] text-obsidian transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={added ? "added" : inStock ? "add" : "oos"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-10 flex items-center justify-center gap-2"
                    >
                      {!inStock ? (
                        <>OUT OF STOCK</>
                      ) : added ? (
                        <>ADDED <Check className="h-3.5 w-3.5" strokeWidth={3} /></>
                      ) : (
                        <>ADD TO BAG <ShoppingBag className="h-3.5 w-3.5" /></>
                      )}
                    </motion.span>
                  </AnimatePresence>
                  <span className="absolute inset-0 shimmer" />
                </button>
                <button
                  onClick={() => setWished((w) => !w)}
                  data-cursor
                  className={`grid w-14 place-items-center rounded-full border transition-all ${
                    wished ? "border-gold bg-gold/10 text-gold" : "border-gold/25 hover:border-gold/50"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${wished ? "fill-gold" : ""}`} />
                </button>
              </div>
              <button
                disabled={!inStock}
                data-cursor
                className="rounded-full border border-gold/30 py-5 text-xs font-medium tracking-[0.3em] text-foreground hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                BUY NOW
              </button>
            </div>

            {/* Reassurance */}
            <ul className="mt-12 space-y-4 border-t border-gold/15 pt-8">
              {[
                { icon: Truck, t: "Complimentary worldwide delivery", d: "2–5 business days, fully insured." },
                { icon: Shield, t: "Lifetime authenticity guarantee", d: "Numbered certificate included." },
                { icon: RotateCcw, t: "30-day returns", d: "Returns accepted on unsealed objects." },
              ].map((r) => (
                <li key={r.t} className="flex gap-4">
                  <r.icon className="mt-1 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <div className="text-sm font-medium">{r.t}</div>
                    <div className="text-xs text-muted-foreground">{r.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <Tabs p={p} />
      <Reviews p={p} />
      <Related items={related} />
    </main>
  );
}
