import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Category } from "@/lib/products";
import { fetchPublicByCategory } from "@/lib/catalogFns";
import { TechSubNav, PerfumeSubNav } from "@/components/CategorySubNav";
import { useI18n } from "@/lib/i18n";
import { useEffect } from "react";
import { useCategory } from "@/lib/categoryContext";

export const Route = createFileRoute("/shop/$category/$sub")({
  loader: async ({ params }) => {
    if (params.category !== "tech" && params.category !== "parfum") throw notFound();
    const category = params.category as Category;
    const products = await fetchPublicByCategory({ data: { category } });
    return { category, sub: params.sub, products };
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.category === "tech" ? "LEO TECH HUB" : "LEO SIGNATURE"} — ${loaderData.sub.replace(/-/g, " ")}`
      : "Shop";
    return {
      meta: [
        { title },
        { name: "description", content: `Browse ${loaderData?.sub ?? ""} collection.` },
        { property: "og:title", content: title },
      ],
    };
  },
  component: ShopPage,
});

function ShopPage() {
  const { category, sub, products: all } = Route.useLoaderData();
  const { t } = useI18n();
  const { setCategory } = useCategory();

  useEffect(() => { setCategory(category); }, [category, setCategory]);

  const list = sub === "all" ? all : all.filter((p) => p.subCategory === sub);

  const label = sub.replace(/-/g, " ");

  return (
    <main className="min-h-screen bg-obsidian pb-32">
      <div className="hidden md:block">
        {category === "tech"
          ? <TechSubNav active={sub} />
          : <PerfumeSubNav active={sub} />}
      </div>
      <div className="md:hidden h-14 sm:h-16" />


      <section className="mx-auto max-w-[1500px] px-6 pt-16 lg:px-12">
        <div className="mb-10">
          <div className="mb-3 text-[10px] tracking-[0.5em] text-gold/70">
            {category === "tech" ? "LEO TECH HUB" : "LEO SIGNATURE"}
          </div>
          <h1 className="font-display text-4xl uppercase tracking-tight text-foreground md:text-6xl">
            {label}
          </h1>
        </div>

        {list.length === 0 ? (
          <div className="py-24 text-center text-sm tracking-[0.3em] text-muted-foreground">
            — {t("best.empty") || "NO PRODUCTS"} —
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {list.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="group"
              >
                <Link to="/product/$id" params={{ id: p.id }} className="block group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-obsidian-2">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="w-full rounded-full bg-gold-gradient py-2.5 text-[10px] font-semibold tracking-[0.3em] text-obsidian hover:brightness-110"
                      >
                        {t("card.addcart")}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="w-full rounded-full border border-gold/60 bg-obsidian/70 py-2.5 text-[10px] font-semibold tracking-[0.3em] text-gold backdrop-blur hover:bg-gold hover:text-obsidian transition-colors"
                      >
                        {t("card.buynow")}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3 px-3 py-3 rounded-b-md [.theme-tech_&]:bg-sky-100 [.theme-tech_&]:rounded-md">
                    <div>
                      <div className="text-[9px] tracking-[0.3em] text-gold/70 [.theme-tech_&]:text-blue-700/70">{p.line.toUpperCase()}</div>
                      <h3 className="mt-1 font-display text-lg text-foreground [.theme-tech_&]:text-blue-700">{p.name}</h3>
                    </div>
                    <div className="font-display text-lg text-gold [.theme-tech_&]:text-black">€{p.price}</div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
