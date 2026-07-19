import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, User, ShoppingBag, Globe, Menu, X, Settings, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCategory, type Category } from "@/lib/categoryContext";
import { TECH_SUB_LINKS, PARFUM_SUB_LINKS } from "@/components/CategorySubNav";
import { ADMIN_PANEL_URL } from "@/lib/adminPanelUrl";

export function Header() {
  const { t, toggle, lang } = useI18n();
  const { category, setCategory } = useCategory();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-2xl bg-obsidian/70 border-b border-gold/15 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]"
            : "bg-gradient-to-b from-obsidian/60 to-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 h-14 sm:h-16 sm:gap-4 sm:px-6 lg:h-20 lg:px-12">
          {/* LEFT */}
          <div className="flex items-center gap-4 min-w-0 shrink-0">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 text-[10px] tracking-[0.35em] text-foreground/70 hover:text-gold transition-colors shrink-0"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
              <span className="hidden sm:inline">MENU</span>
            </button>
          </div>

          {/* CENTER — logo */}
          <div className="flex flex-1 items-center justify-center min-w-0">
            <Link to="/" className="font-display text-[11px] sm:text-base tracking-[0.2em] sm:tracking-[0.35em] text-foreground md:text-lg lg:text-xl whitespace-nowrap truncate">
              LEO <span className="text-gold-gradient font-medium">{category === "parfum" ? "SIGNATURE" : "TECH HUB"}</span>
            </Link>
          </div>

          {/* Desktop-only pill between logo and icons */}
          <div className="hidden lg:block shrink-0">
            <CategoryPill category={category} setCategory={setCategory} />
          </div>

          {/* RIGHT — icons always visible */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-4 text-foreground/80 shrink-0">
            <button aria-label="Search" className="hover:text-gold transition-colors"><Search className="h-4 w-4" /></button>
            <button aria-label="Wishlist" className="hover:text-gold transition-colors"><Heart className="h-4 w-4" /></button>
            <a
              href={ADMIN_PANEL_URL}
              aria-label="Admin"
              className="hover:text-gold transition-colors"
            >
              <Settings className="h-4 w-4" />
            </a>
            <button aria-label="Account" className="hover:text-gold transition-colors"><User className="h-4 w-4" /></button>
            <button aria-label="Cart" className="relative hover:text-gold transition-colors">
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-gold-gradient text-[9px] font-semibold text-obsidian">2</span>
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle language"
              className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-foreground/70 hover:text-gold border border-gold/20 rounded-full px-1.5 sm:px-2.5 py-1 transition-colors"
            >
              <Globe className="h-3 w-3" /> {lang.toUpperCase()}
            </button>
          </div>
        </div>

      </motion.header>

      {/* Mobile / fullscreen menu */}
      <AnimatePresence>
        {open && <MenuOverlay onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function CategoryPill({ category, setCategory }: { category: Category; setCategory: (c: Category) => void }) {
  const { t } = useI18n();
  return (
    <div className="relative inline-flex items-center rounded-full border border-gold/25 bg-obsidian/70 backdrop-blur-xl p-1">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className={`absolute inset-y-1 rounded-full bg-gold-gradient shadow-[0_0_25px_oklch(0.78_0.10_80/0.45)] ${
          category === "parfum" ? "left-1 right-[50%]" : "left-[50%] right-1"
        }`}
      />
      {(["parfum", "tech"] as Category[]).map((c) => (
        <button
          key={c}
          onClick={() => setCategory(c)}
          className={`relative z-10 px-5 py-1.5 text-[10px] font-medium tracking-[0.3em] uppercase transition-colors ${
            category === c ? "text-obsidian" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          {c === "parfum" ? t("pill.parfum") : t("pill.tech")}
        </button>
      ))}
    </div>
  );
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { category, setCategory } = useCategory();
  const [expanded, setExpanded] = useState<null | "parfum" | "tech">(category);

  // Escape to close + lock background scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-y-0 left-0 z-[61] w-[85%] max-w-sm bg-obsidian/98 backdrop-blur-2xl border-r border-gold/15 flex flex-col"
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-gold/15 shrink-0">
          <span className="font-display tracking-[0.3em] text-sm text-foreground truncate">
            LEO <span className="text-gold-gradient">{category === "parfum" ? "SIGNATURE" : "TECH HUB"}</span>
          </span>
          <button onClick={onClose} aria-label="Close" className="text-foreground/80 hover:text-gold shrink-0"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-6 overflow-y-auto">
          <Link
            to="/"
            onClick={onClose}
            className="block py-3 px-2 font-display text-xl tracking-[0.15em] text-foreground hover:text-gold border-b border-gold/10"
          >
            {t("nav.home")}
          </Link>

          <ExpandableGroup
            label={t("nav.parfum")}
            open={expanded === "parfum"}
            onToggle={() => setExpanded(expanded === "parfum" ? null : "parfum")}
            onHeaderClick={() => { setCategory("parfum"); onClose(); }}
            items={PARFUM_SUB_LINKS.map((i) => ({
              label: t(i.tk),
              to: "/shop/$category/$sub" as const,
              params: { category: "parfum" as const, sub: i.key },
            }))}
            onItemClick={onClose}
          />

          <ExpandableGroup
            label={t("nav.tech")}
            open={expanded === "tech"}
            onToggle={() => setExpanded(expanded === "tech" ? null : "tech")}
            onHeaderClick={() => { setCategory("tech"); onClose(); }}
            items={TECH_SUB_LINKS.map((i) => ({
              label: t(i.tk),
              to: "/shop/$category/$sub" as const,
              params: { category: "tech" as const, sub: i.key },
            }))}
            onItemClick={onClose}
          />

          <a
            href={ADMIN_PANEL_URL}
            onClick={onClose}
            className="block py-3 px-2 font-display text-xl tracking-[0.15em] text-foreground hover:text-gold border-b border-gold/10"
          >
            {t("nav.admin")}
          </a>
        </nav>
      </motion.aside>
    </>
  );
}

type SubLink = {
  label: string;
  to: "/shop/$category/$sub";
  params: { category: "parfum" | "tech"; sub: string };
};

function ExpandableGroup({
  label, open, onToggle, onHeaderClick, items, onItemClick,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  onHeaderClick: () => void;
  items: SubLink[];
  onItemClick: () => void;
}) {
  return (
    <div className="border-b border-gold/10">
      <div className="flex items-stretch">
        <button
          onClick={onHeaderClick}
          className="flex-1 text-left py-3 px-2 font-display text-xl tracking-[0.15em] text-foreground hover:text-gold"
        >
          {label}
        </button>
        <button
          onClick={onToggle}
          aria-label={open ? "Collapse" : "Expand"}
          aria-expanded={open}
          className="px-3 text-foreground/70 hover:text-gold"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col pb-3 pl-4">
              {items.map((it) => (
                <Link
                  key={`${it.params.category}-${it.params.sub}`}
                  to={it.to}
                  params={it.params}
                  onClick={onItemClick}
                  className="py-2 text-[11px] tracking-[0.3em] uppercase text-foreground/75 hover:text-gold"
                >
                  {it.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

