import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Search, ShoppingBag, Heart, User, Menu, ChevronRight,
  Star, Sparkles, Award, Truck, Shield, Globe, ArrowUpRight, ArrowUp, ChevronDown,
} from "lucide-react";


import perfumeHero from "@/assets/perfume-hero.jpg";
import accessoriesHero from "@/assets/accessories-hero.jpg";

import leoPerfumeHeroVideo from "@/assets/leo perfume hero section.mp4";
import leoTechHeroVideo from "@/assets/tech/LEO TECH HERO SECTION.mp4";
import techLeoSectionVideo from "@/assets/tech/tech leo section.mp4";
import atelierParfum from "@/assets/atelier-parfum.jpg";
import atelierTech from "@/assets/atelier-tech.jpg";
import { useCategory, type Category as SharedCategory } from "@/lib/categoryContext";
import { useI18n } from "@/lib/i18n";
import { productsByCategory, type Product, type TechSubCategory, type ParfumSubCategory } from "@/lib/products";
import { TechSubNav as SharedTechSubNav, PerfumeSubNav as SharedPerfumeSubNav } from "@/components/CategorySubNav";

export const Route = createFileRoute("/")({

  head: () => ({
    meta: [
      { title: "MAISON AURUM — Luxury Perfumes & Premium Mobile Accessories" },
      { name: "description", content: "An obsessive collection of rare fragrances and futuristic mobile accessories. Two houses, one obsession with the extraordinary." },
      { property: "og:title", content: "MAISON AURUM — Two Worlds. One Obsession." },
      { property: "og:description", content: "Luxury perfumes meet next-generation mobile accessories." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

type Category = "parfum" | "tech";

const TECH_SUB_ITEMS: { key: TechSubCategory | "all"; tk: string }[] = [
  { key: "all", tk: "tech.sub.all" },
  { key: "chargers", tk: "tech.sub.chargers" },
  { key: "power-banks", tk: "tech.sub.powerbanks" },
  { key: "earphones", tk: "tech.sub.earphones" },
  { key: "speakers", tk: "tech.sub.speakers" },
  { key: "smartwatches", tk: "tech.sub.smartwatches" },
  { key: "adapters", tk: "tech.sub.adapters" },
  { key: "lightning-chargers", tk: "tech.sub.lightning" },
  { key: "wires", tk: "tech.sub.wires" },
];

const HOCO_DROPDOWN: { key: TechSubCategory; tk: string }[] = [
  { key: "beauty-care", tk: "tech.sub.beauty" },
  { key: "other-hoco", tk: "tech.sub.other" },
];

const PARFUM_SUB_ITEMS: { key: ParfumSubCategory | "all"; tk: string }[] = [
  { key: "all", tk: "parfum.sub.all" },
  { key: "for-her", tk: "parfum.sub.forher" },
  { key: "for-him", tk: "parfum.sub.forhim" },
  { key: "attars", tk: "parfum.sub.attars" },
  { key: "testers", tk: "parfum.sub.testers" },
  { key: "new-arrivals", tk: "parfum.sub.new" },
  { key: "limited-edition", tk: "parfum.sub.limited" },
];


/* ---------- Loading overlay ---------- */
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const { t: tt } = useI18n();
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] grid place-items-center bg-obsidian noise"
    >
      <div className="relative flex flex-col items-center gap-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="font-display text-lg sm:text-3xl md:text-5xl tracking-[0.2em] sm:tracking-[0.3em] text-gold-gradient text-center px-4 leading-tight">
            LEO <span className="italic">THE AURA</span> &amp; TECH
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }}
            className="mt-4 h-px bg-gold-gradient origin-left"
          />
          <div className="mt-3 text-[10px] tracking-[0.5em] text-muted-foreground">{tt("loading.est")}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] tracking-[0.4em] text-gold/60"
        >
          {tt("loading.entering")}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------- Cursor ---------- */
function LuxCursor() {
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const y = useSpring(0, { stiffness: 300, damping: 30 });
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX - 16); y.set(e.clientY - 16); };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHover(!!t.closest("a,button,[data-cursor]"));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); };
  }, [x, y]);
  return (
    <motion.div
      style={{ x, y }}
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden md:block"
    >
      <motion.div
        animate={{ scale: hover ? 2.4 : 1, opacity: hover ? 0.6 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="h-8 w-8 rounded-full border border-gold/70 mix-blend-difference"
      />
    </motion.div>
  );
}

/* ---------- Header ---------- */
function Header({ category, setCategory }: { category: Category; setCategory: (c: Category) => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-panel border-b border-gold/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 lg:px-12">
        <button className="hidden items-center gap-2 text-xs tracking-[0.3em] text-foreground/80 hover:text-gold md:flex" data-cursor>
          <Menu className="h-4 w-4" /> MENU
        </button>
        <div className="flex items-center gap-6">
          <button className="md:hidden"><Menu className="h-5 w-5 text-gold" /></button>
          <div className="font-display text-xl tracking-[0.4em] text-foreground md:text-2xl">
            MAISON <span className="text-gold-gradient font-medium">AURUM</span>
          </div>
        </div>
        <div className="hidden items-center gap-8 lg:flex">
          <CategoryPill category={category} setCategory={setCategory} compact />
        </div>
        <div className="flex items-center gap-5 text-foreground/80">
          <button data-cursor className="hover:text-gold"><Search className="h-4 w-4" /></button>
          <button data-cursor className="hover:text-gold"><Heart className="h-4 w-4" /></button>
          <button data-cursor className="hidden sm:block hover:text-gold"><User className="h-4 w-4" /></button>
          <button data-cursor className="relative hover:text-gold">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-gold-gradient text-[9px] font-semibold text-obsidian">2</span>
          </button>
          <button className="hidden items-center gap-1 text-xs tracking-[0.2em] text-foreground/70 hover:text-gold sm:flex" data-cursor>
            <Globe className="h-3.5 w-3.5" /> EN
          </button>
        </div>
      </div>
    </motion.header>
  );
}

/* ---------- Category switcher ---------- */
function CategoryPill({
  category, setCategory, compact = false,
}: { category: Category; setCategory: (c: Category) => void; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`relative inline-flex items-center rounded-full border border-gold/20 bg-obsidian/60 backdrop-blur-xl ${compact ? "p-1" : "p-1.5"}`}>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className={`absolute inset-y-1 rounded-full bg-gold-gradient shadow-[0_0_30px_oklch(0.78_0.10_80/0.4)] ${
          category === "parfum" ? "left-1 right-[50%]" : "left-[50%] right-1"
        }`}
      />
      {(["parfum", "tech"] as Category[]).map((c) => (
        <button
          key={c}
          data-cursor
          onClick={() => setCategory(c)}
          className={`relative z-10 ${compact ? "px-5 py-1.5 text-[10px]" : "px-8 py-3 text-xs"} font-medium tracking-[0.3em] uppercase transition-colors ${
            category === c ? "text-obsidian" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          {c === "parfum" ? t("pill.parfum") : t("pill.tech")}
        </button>
      ))}
    </div>
  );
}

/* ---------- Sticky bar under header with the parfum/tech pill ---------- */
function CategorySwitchBar({ category, setCategory }: { category: Category; setCategory: (c: Category) => void }) {
  return (
    <div className="relative z-40 border-b border-gold/15 bg-obsidian/90 backdrop-blur-xl pt-16 sm:pt-16 lg:hidden">
      <div className="flex items-center justify-center px-4 py-3">
        <CategoryPill category={category} setCategory={setCategory} compact />
      </div>
    </div>
  );
}



/* ---------- Hero ---------- */
function Hero({ category, setCategory }: { category: Category; setCategory: (c: Category) => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const isPerfume = category === "parfum";
  const heroImg = isPerfume ? perfumeHero : accessoriesHero;


  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden noise">
      {/* Radial gold glow */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 opacity-60"
      >
        <div className="absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "var(--gradient-radial-gold)" }} />
      </motion.div>

      {/* Background video — cinematic crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={category}
          initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ y, scale }}
          className="absolute inset-0"
        >
          <video
            src={isPerfume ? leoPerfumeHeroVideo : leoTechHeroVideo}
            poster={heroImg}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            // @ts-ignore
            webkit-playsinline="true"
            disableRemotePlayback
            ref={(el) => { if (el) { el.muted = true; el.play().catch(() => {}); } }}
            className={`h-full w-full object-cover ${isPerfume ? "opacity-60" : "opacity-100"}`}
          />
          {isPerfume && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/40" />
            </>
          )}
          {!isPerfume && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gold/40"
            style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col justify-end px-6 pb-24 pt-40 lg:px-12 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-10 flex items-center gap-4"
        >
          <span className="h-px w-12 bg-gold/50" />
          <span className="text-[10px] tracking-[0.5em] text-gold/80">
            {isPerfume ? t("hero.eyebrow.parfum") : t("hero.eyebrow.tech")}
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.h1
            key={category}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={`font-display leading-[0.95] tracking-[-0.02em] ${
              isPerfume
                ? "text-[clamp(3rem,11vw,11rem)] text-foreground"
                : "text-[clamp(2rem,5.5vw,5rem)] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]"
            }`}
          >
            <span className="block italic font-light">
              {isPerfume ? t("hero.title.1.parfum") : t("hero.title.1.tech")}
            </span>
            <span className="block text-gold-gradient">
              {t("hero.title.2")}
            </span>
          </motion.h1>
        </AnimatePresence>

        <div className="mt-12 flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
          <motion.p
            key={`p-${category}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`max-w-md ${isPerfume ? "text-base md:text-lg text-muted-foreground" : "text-sm md:text-base text-white/90"}`}
          >
            {isPerfume ? t("hero.parfum.sub") : t("hero.tech.sub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col items-start gap-6"
          >
            <CategoryPill category={category} setCategory={setCategory} />
            <div className="flex flex-wrap items-center gap-3">
              <button
                data-cursor
                onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}
                className={`group relative overflow-hidden rounded-full bg-gold-gradient font-semibold tracking-[0.25em] text-obsidian transition-transform hover:scale-[1.02] ${isPerfume ? "px-8 py-4 text-xs" : "px-5 py-2.5 text-[10px]"}`}
              >
                <span className="relative z-10 flex items-center gap-2">{t("hero.cta.discover")} <ArrowUpRight className="h-3.5 w-3.5" /></span>
                <span className="absolute inset-0 shimmer" />
              </button>
              <button
                data-cursor
                onClick={() => document.getElementById("atelier")?.scrollIntoView({ behavior: "smooth" })}
                className={`rounded-full border font-medium tracking-[0.25em] hover:bg-gold/5 ${isPerfume ? "border-gold/30 text-foreground px-8 py-4 text-xs" : "border-white/40 text-white px-5 py-2.5 text-[10px]"}`}
              >
                {t("hero.cta.maison")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] text-gold/60"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            {t("hero.scroll")}
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}

/* ---------- Marquee ---------- */
function Marquee() {
  const { t } = useI18n();
  const items = [t("marquee.delivery"), "✦", t("marquee.auth"), "✦", t("marquee.artisan"), "✦", t("marquee.limited"), "✦", t("marquee.rewards"), "✦"];
  return (
    <div className="relative overflow-hidden border-y border-gold/15 bg-obsidian-2 py-5">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        className="flex gap-12 whitespace-nowrap text-xs tracking-[0.4em] text-gold/70"
      >
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- Featured houses ---------- */
function FeaturedHouses({ setCategory }: { setCategory: (c: Category) => void }) {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-32 lg:px-12">
      <Reveal>
        <div className="mb-16 flex items-end justify-between">
          <div>
            <div className="mb-3 text-[10px] tracking-[0.5em] text-gold/70">{t("houses.eyebrow")}</div>
            <h2 className="font-display text-5xl tracking-tight md:text-7xl">
              {t("houses.title.1")} <span className="italic">{t("houses.title.2")}</span>.
            </h2>
          </div>
          <div className="hidden max-w-sm text-sm text-muted-foreground md:block">
            {t("houses.desc")}
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          { key: "parfum" as Category, img: perfumeHero, label: t("houses.parfum.label"), count: t("houses.parfum.count"), desc: t("houses.parfum.desc") },
          { key: "tech" as Category, img: accessoriesHero, label: t("houses.tech.label"), count: t("houses.tech.count"), desc: t("houses.tech.desc") },
        ].map((h, i) => (
          <Reveal key={h.key} delay={i * 0.15}>
            <button
              onClick={() => { setCategory(h.key); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              data-cursor
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-sm border border-gold/15"
            >
              <motion.img
                src={h.img} alt={h.label}
                loading="lazy" width={800} height={1000}
                className="h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-left md:p-12">
                <div className="text-[10px] tracking-[0.4em] text-gold/80">{h.count.toUpperCase()}</div>
                <div className="mt-2 font-display text-4xl md:text-6xl text-gold-gradient">{h.label}</div>
                <div className="mt-3 max-w-xs text-sm text-foreground/70">{h.desc}</div>
                <div className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.3em] text-foreground group-hover:text-gold">
                  {t("hero.cta.maison")} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}


/* ---------- Tech sub-navbar ---------- */
function TechSubNav({
  filter, setFilter,
}: { filter: TechSubCategory | "all"; setFilter: (s: TechSubCategory | "all") => void }) {
  const { t } = useI18n();
  const [hocoOpen, setHocoOpen] = useState(false);
  const scrollToGrid = () => {
    const el = document.getElementById("collection");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const pick = (k: TechSubCategory | "all") => { setFilter(k); setTimeout(scrollToGrid, 60); };
  const isHocoActive = filter === "beauty-care" || filter === "other-hoco";
  return (
    <nav className="relative z-40 border-b border-gold/15 bg-obsidian/85 backdrop-blur-xl pt-20 lg:pt-24">

      <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-6 py-3 text-[11px] tracking-[0.25em] lg:px-12">
        {TECH_SUB_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => pick(item.key)}
            data-cursor
            className={`shrink-0 rounded-full border px-4 py-2 transition-colors ${
              filter === item.key
                ? "border-gold bg-gold-gradient text-obsidian"
                : "border-gold/20 text-foreground/75 hover:border-gold/50 hover:text-gold"
            }`}
          >
            {t(item.tk).toUpperCase()}
          </button>
        ))}
        {/* HOCO dropdown */}
        <div
          className="relative shrink-0"
          onMouseEnter={() => setHocoOpen(true)}
          onMouseLeave={() => setHocoOpen(false)}
        >
          <button
            data-cursor
            className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 transition-colors ${
              isHocoActive
                ? "border-gold bg-gold-gradient text-obsidian"
                : "border-gold/20 text-foreground/75 hover:border-gold/50 hover:text-gold"
            }`}
          >
            {t("tech.sub.hoco")} <ChevronDown className="h-3 w-3" />
          </button>
          <AnimatePresence>
            {hocoOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-full mt-2 min-w-[220px] overflow-hidden rounded-md border border-gold/25 bg-obsidian/95 shadow-xl backdrop-blur-xl"
              >
                {HOCO_DROPDOWN.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => pick(d.key)}
                    className="block w-full px-4 py-3 text-left text-[11px] tracking-[0.2em] text-foreground/80 hover:bg-gold/10 hover:text-gold"
                  >
                    {t(d.tk).toUpperCase()}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}


function PerfumeSubNav({
  filter, setFilter,
}: { filter: ParfumSubCategory | "all"; setFilter: (s: ParfumSubCategory | "all") => void }) {
  const { t } = useI18n();
  const scrollToGrid = () => {
    const el = document.getElementById("collection");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const pick = (k: ParfumSubCategory | "all") => { setFilter(k); setTimeout(scrollToGrid, 60); };
  return (
    <nav className="relative z-40 border-b border-gold/15 bg-obsidian/85 backdrop-blur-xl pt-20 lg:pt-24">
      <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-6 py-3 text-[11px] tracking-[0.25em] lg:px-12">
        {PARFUM_SUB_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => pick(item.key)}
            data-cursor
            className={`shrink-0 rounded-full border px-4 py-2 transition-colors ${
              filter === item.key
                ? "border-gold bg-gold-gradient text-obsidian"
                : "border-gold/20 text-foreground/75 hover:border-gold/50 hover:text-gold"
            }`}
          >
            {t(item.tk).toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}


/* ---------- Product grid ---------- */
function BestSellers({
  category,
  techFilter,
  setTechFilter,
  parfumFilter,
  setParfumFilter,
}: {
  category: Category;
  techFilter: TechSubCategory | "all";
  setTechFilter: (s: TechSubCategory | "all") => void;
  parfumFilter: ParfumSubCategory | "all";
  setParfumFilter: (s: ParfumSubCategory | "all") => void;
}) {
  const { t } = useI18n();
  const all = productsByCategory(category);
  const list: Product[] =
    category === "tech" && techFilter !== "all"
      ? all.filter((p) => p.subCategory === techFilter)
      : category === "parfum" && parfumFilter !== "all"
      ? all.filter((p) => p.subCategory === parfumFilter)
      : all;
  return (
    <section id="collection" className="relative bg-obsidian-2 py-32">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="mb-3 text-[10px] tracking-[0.5em] text-gold/70">{t("best.eyebrow")}</div>
              <h2 className="font-display text-5xl tracking-tight md:text-7xl">
                {t("best.title.1")} <span className="italic text-gold-gradient">{t("best.title.2")}</span>.
              </h2>
            </div>
            <button className="hidden items-center gap-2 text-xs tracking-[0.3em] text-foreground/70 hover:text-gold md:flex" data-cursor>
              {t("best.viewall")} <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </Reveal>

        {/* Tech filter pills */}
        {category === "tech" && (
          <div className="mb-12 flex flex-wrap gap-2">
            {[{ key: "all" as const, tk: "tech.sub.all" }, ...TECH_SUB_ITEMS.slice(1), ...HOCO_DROPDOWN].map((p) => (
              <button
                key={p.key}
                onClick={() => setTechFilter(p.key as TechSubCategory | "all")}
                data-cursor
                className={`rounded-full border px-4 py-2 text-[10px] tracking-[0.25em] transition-colors ${
                  techFilter === p.key
                    ? "border-gold bg-gold-gradient text-obsidian"
                    : "border-gold/20 text-foreground/70 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {t(p.tk).toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Perfume filter pills */}
        {category === "parfum" && (
          <div className="mb-12 flex flex-wrap gap-2">
            {PARFUM_SUB_ITEMS.map((p) => (
              <button
                key={p.key}
                onClick={() => setParfumFilter(p.key)}
                data-cursor
                className={`rounded-full border px-4 py-2 text-[10px] tracking-[0.25em] transition-colors ${
                  parfumFilter === p.key
                    ? "border-gold bg-gold-gradient text-obsidian"
                    : "border-gold/20 text-foreground/70 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {t(p.tk).toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${techFilter}-${parfumFilter}`}
            initial={{ opacity: 0, y: 30 }}

            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="grid gap-x-5 gap-y-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
          >
            {list.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="group"
                data-cursor
              >
                <Link to="/product/$id" params={{ id: p.id }} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-obsidian">
                    <span className="absolute left-4 top-4 z-10 rounded-full border border-gold/40 bg-obsidian/60 px-3 py-1 text-[9px] tracking-[0.3em] text-gold backdrop-blur">
                      {p.tag.toUpperCase()}
                    </span>
                    <img src={p.images[0]} alt={p.name} loading="lazy" width={800} height={1000}
                      className="h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
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
                  <div className="mt-4 flex items-start justify-between gap-4 rounded-b-md px-3 py-3 [.theme-tech_&]:bg-sky-100 [.theme-tech_&]:rounded-md">
                    <div>
                      <div className="text-[10px] tracking-[0.3em] text-gold/70 [.theme-tech_&]:text-blue-700/70">{p.line.toUpperCase()}</div>
                      <h3 className="mt-1 font-display text-2xl text-foreground [.theme-tech_&]:text-blue-700">{p.name}</h3>
                    </div>
                    <div className="font-display text-xl text-gold [.theme-tech_&]:text-black">€{p.price}</div>
                  </div>
                </Link>
              </motion.article>
            ))}
            {list.length === 0 && (
              <div className="col-span-full py-20 text-center text-sm tracking-[0.3em] text-muted-foreground">
                — NO PRODUCTS —
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- Premium showcase (split section) ---------- */
function PremiumShowcase({ category }: { category: Category }) {
  const { t } = useI18n();
  const isPerfume = category === "parfum";
  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[120vh] w-[120vh] -translate-x-1/2 -translate-y-1/2 rounded-full animate-glow-pulse"
          style={{ background: "var(--gradient-radial-gold)" }} />
      </div>
      <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-6 lg:grid-cols-2 lg:px-12">
        <Reveal>
          <div className="relative">
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 1.5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="relative aspect-[3/4] overflow-hidden gold-border-glow"
            >
              <AnimatePresence mode="wait">
                {isPerfume ? (
                  <motion.img
                    key="parfum-img"
                    src={perfumeHero}
                    alt=""
                    loading="lazy" width={800} height={1000}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8 }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <motion.video
                    key="tech-video"
                    src={techLeoSectionVideo}
                    autoPlay muted loop playsInline preload="auto"
                    // @ts-ignore
                    webkit-playsinline="true"
                    ref={(el) => { if (el) { (el as HTMLVideoElement).muted = true; (el as HTMLVideoElement).play().catch(() => {}); } }}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8 }}
                    className="h-full w-full object-cover"
                  />
                )}
              </AnimatePresence>
            </motion.div>
            <div className="absolute -bottom-6 -right-6 glass-panel px-6 py-4 text-center">
              <div className="text-[10px] tracking-[0.3em] text-gold">{t("premium.edition")}</div>
              <div className="font-display text-3xl text-gold-gradient">N° 24</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div>
            <div className="mb-3 text-[10px] tracking-[0.5em] text-gold/70">{t("premium.eyebrow")}</div>
            <h2 className="font-display text-5xl md:text-7xl leading-[1.02]">
              {isPerfume
                ? <>{t("premium.title.parfum.1")} <span className="italic text-gold-gradient">{t("premium.title.parfum.2")}</span>.</>
                : <>{t("premium.title.tech.1")} <span className="italic text-gold-gradient">{t("premium.title.tech.2")}</span>.</>}
            </h2>
            <p className="mt-8 max-w-md text-muted-foreground">
              {isPerfume ? t("premium.copy.parfum") : t("premium.copy.tech")}
            </p>
            <ul className="mt-10 space-y-5">
              {[
                { icon: Award, t: t("premium.feat.1.t"), d: t("premium.feat.1.d") },
                { icon: Sparkles, t: t("premium.feat.2.t"), d: t("premium.feat.2.d") },
                { icon: Shield, t: t("premium.feat.3.t"), d: t("premium.feat.3.d") },
              ].map((f) => (
                <li key={f.t} className="flex gap-5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/30 text-gold">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-xl">{f.t}</div>
                    <div className="text-sm text-muted-foreground">{f.d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <button className="mt-12 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-4 text-xs font-semibold tracking-[0.25em] text-obsidian" data-cursor>
              {t("premium.cta")} <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
function Testimonials() {
  const { t } = useI18n();
  const reviews = [
    { name: "Aria L.", title: t("voices.r1.title"), body: t("voices.r1.body"), rating: 5 },
    { name: "Khaled M.", title: t("voices.r2.title"), body: t("voices.r2.body"), rating: 5 },
    { name: "Sofia R.", title: t("voices.r3.title"), body: t("voices.r3.body"), rating: 5 },
  ];
  return (
    <section className="bg-obsidian-2 py-32">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <Reveal>
          <div className="mb-3 text-[10px] tracking-[0.5em] text-gold/70">{t("voices.eyebrow")}</div>
          <h2 className="font-display text-5xl tracking-tight md:text-7xl mb-16">
            {t("voices.title.1")} <span className="italic">{t("voices.title.2")}</span>.
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.1}>
              <div className="glass-panel h-full rounded-sm p-10">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-gold" />)}
                </div>
                <p className="mt-6 font-display text-2xl leading-snug text-foreground/90">"{r.body}"</p>
                <div className="mt-8 border-t border-gold/15 pt-5">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-[10px] tracking-[0.3em] text-muted-foreground mt-1">{r.title.toUpperCase()}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ---------- Newsletter ---------- */
function Newsletter() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "var(--gradient-radial-gold)" }} />
      </div>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <div className="mb-3 text-[10px] tracking-[0.5em] text-gold">{t("news.eyebrow")}</div>
          <h2 className="font-display text-5xl leading-tight md:text-7xl">
            {t("news.title.1")} <span className="italic text-gold-gradient">{t("news.title.2")}</span>.
          </h2>
          <p className="mt-6 text-muted-foreground">
            {t("news.copy")}
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <input type="email" placeholder={t("news.placeholder")} className="flex-1 rounded-full border border-gold/25 bg-obsidian-2 px-6 py-4 text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
            <button className="rounded-full bg-gold-gradient px-8 py-4 text-xs font-semibold tracking-[0.25em] text-obsidian" data-cursor>{t("news.join")}</button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-gold/15 bg-obsidian-2 pt-24 pb-10">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-16 grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="font-display text-2xl tracking-[0.4em]">MAISON <span className="text-gold-gradient">AURUM</span></div>
            <p className="mt-6 max-w-xs text-sm text-muted-foreground">Haute parfumerie & engineered jewelry for the modern obsessive. Crafted in Europe, shipped worldwide.</p>
            <div className="mt-8 flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-gold" /> Free worldwide</span>
              <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-gold" /> Lifetime authenticity</span>
            </div>
          </div>
          {[
            { t: "Maison", l: ["Parfumerie", "Studio Tech", "Premium", "Editions"] },
            { t: "Account", l: ["Sign in", "Orders", "Wishlist", "Members"] },
            { t: "Cared for", l: ["Contact", "Shipping", "Returns", "FAQ"] },
          ].map((c) => (
            <div key={c.t}>
              <div className="mb-5 text-[10px] tracking-[0.4em] text-gold">{c.t.toUpperCase()}</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {c.l.map((i) => <li key={i}><a href="#" className="hover:text-gold transition-colors">{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gold/10 pt-8 text-xs text-muted-foreground md:flex-row">
          <div>© 2025 MAISON AURUM. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold">Privacy</a>
            <a href="#" className="hover:text-gold">Terms</a>
            <a href="#" className="hover:text-gold">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Whatsapp floating ---------- */
function WhatsappBtn() {
  return (
    <a href="#" data-cursor className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold-gradient shadow-[0_10px_40px_oklch(0.78_0.10_80/0.4)] transition-transform hover:scale-110">
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-obsidian"><path d="M20.5 3.5A10 10 0 0 0 3.6 17.3L2 22l4.8-1.5A10 10 0 1 0 20.5 3.5Zm-8.4 16.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-2.9.9.9-2.8-.2-.3a8.2 8.2 0 1 1 6.7 3.6Zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.1-.5 0a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4c-.1-.1-.5-1.4-.7-1.9s-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.1c0 1.3.9 2.5 1 2.6s1.8 2.7 4.3 3.8a14 14 0 0 0 1.4.5 3.4 3.4 0 0 0 1.6.1 2.7 2.7 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>
    </a>
  );
}

/* ---------- Back to top ---------- */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          data-cursor
          className="fixed bottom-24 right-6 z-40 grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-obsidian/80 text-gold backdrop-blur hover:bg-gold hover:text-obsidian transition-colors shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---------- Reveal helper ---------- */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Page ---------- */
function HomePage() {
  const [loading, setLoading] = useState(true);
  const { category, setCategory } = useCategory();
  const [techFilter, setTechFilter] = useState<TechSubCategory | "all">("all");
  const [parfumFilter, setParfumFilter] = useState<ParfumSubCategory | "all">("all");

  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen onDone={() => setLoading(false)} />}</AnimatePresence>
      <LuxCursor />
      <main className="relative">
        <CategorySwitchBar category={category} setCategory={setCategory} />
        <div className="hidden md:block lg:pt-20">
          {category === "tech" && <SharedTechSubNav standalone={false} />}
          {category === "parfum" && <SharedPerfumeSubNav standalone={false} />}
        </div>

        <Hero category={category} setCategory={setCategory} />



        <Marquee />
        <FeaturedHouses setCategory={setCategory} />
        <BestSellers category={category} techFilter={techFilter} setTechFilter={setTechFilter} parfumFilter={parfumFilter} setParfumFilter={setParfumFilter} />

        <PremiumShowcase category={category} />
        <AtelierFilm category={category} />
        <Testimonials />
        <Newsletter />
      </main>
      <WhatsappBtn />
      <BackToTop />
    </>
  );
}


/* ---------- Atelier film (split video + text) ---------- */
function AtelierFilm({ category }: { category: SharedCategory }) {
  const { t } = useI18n();
  const isPerfume = category === "parfum";
  const videoSrc = isPerfume ? leoPerfumeHeroVideo : leoTechHeroVideo;
  const poster = isPerfume ? atelierParfum : atelierTech;
  return (
    <section id="atelier" className="relative py-24 lg:py-32 bg-gradient-to-b from-obsidian to-obsidian-2 overflow-hidden">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-gold/15 aspect-[4/5]">
            <motion.img
              src={poster}
              alt={isPerfume ? "Perfume atelier" : "Tech atelier"}
              loading="lazy"
              width={1024}
              height={1280}
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <video
              src={videoSrc}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              // @ts-ignore
              webkit-playsinline="true"
              ref={(el) => { if (el) { el.muted = true; el.play().catch(() => {}); } }}
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-obsidian/60 via-transparent to-transparent" />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div>
            <div className="mb-4 text-[10px] tracking-[0.5em] text-gold">{t("atelier.eyebrow")}</div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05]">
              {t("atelier.title.1")} <span className="italic text-gold-gradient">{t("atelier.title.2")}</span>.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("atelier.copy")}
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { k: "18", v: t("atelier.stat.months") },
                { k: "<5μ", v: t("atelier.stat.tolerance") },
                { k: "47", v: t("atelier.stat.artisans") },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-3xl md:text-4xl text-gold-gradient">{s.k}</div>
                  <div className="mt-1 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
            <button className="mt-10 inline-flex items-center gap-3 rounded-full bg-gold-gradient px-8 py-4 text-xs font-semibold tracking-[0.3em] text-obsidian hover:shadow-[0_0_40px_oklch(0.78_0.10_80/0.5)] transition-shadow">
              {t("atelier.cta")} <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
