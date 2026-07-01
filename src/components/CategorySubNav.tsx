import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import type { TechSubCategory, ParfumSubCategory } from "@/lib/products";

const TECH_ITEMS: { key: TechSubCategory | "all"; tk: string }[] = [
  { key: "all", tk: "tech.sub.all" },
  { key: "chargers", tk: "tech.sub.chargers" },
  { key: "power-banks", tk: "tech.sub.powerbanks" },
  { key: "earphones", tk: "tech.sub.earphones" },
  { key: "speakers", tk: "tech.sub.speakers" },
  { key: "smartwatches", tk: "tech.sub.smartwatches" },
  { key: "adapters", tk: "tech.sub.adapters" },
  { key: "lightning-chargers", tk: "tech.sub.lightning" },
  { key: "wires", tk: "tech.sub.wires" },
  { key: "beauty-care", tk: "tech.sub.beauty" },
  { key: "other-hoco", tk: "tech.sub.other" },
];

const PARFUM_ITEMS: { key: ParfumSubCategory | "all"; tk: string }[] = [
  { key: "all", tk: "parfum.sub.all" },
  { key: "for-her", tk: "parfum.sub.forher" },
  { key: "for-him", tk: "parfum.sub.forhim" },
  { key: "attars", tk: "parfum.sub.attars" },
  { key: "testers", tk: "parfum.sub.testers" },
  { key: "new-arrivals", tk: "parfum.sub.new" },
  { key: "limited-edition", tk: "parfum.sub.limited" },
];

function pillClass(active: boolean) {
  return `shrink-0 rounded-full border px-3 py-1.5 text-[9px] md:text-[10px] tracking-[0.2em] transition-colors ${
    active
      ? "border-gold bg-gold-gradient text-obsidian"
      : "border-gold/20 text-foreground/75 hover:border-gold/50 hover:text-gold"
  }`;
}

function HomeLink() {
  const { t } = useI18n();
  return (
    <Link to="/" className={pillClass(false)}>
      ⌂ {t("nav.home").toUpperCase()}
    </Link>
  );
}

export function TechSubNav({ active, standalone = true }: { active?: string; standalone?: boolean }) {
  const { t } = useI18n();
  return (
    <nav className={`relative z-40 border-b border-gold/15 bg-obsidian/85 backdrop-blur-xl ${standalone ? "pt-20 lg:pt-24" : ""}`}>
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-1.5 px-4 py-3 lg:px-12">
        <HomeLink />
        {TECH_ITEMS.map((item) => (
          <Link
            key={item.key}
            to="/shop/$category/$sub"
            params={{ category: "tech", sub: item.key }}
            className={pillClass(active === item.key)}
          >
            {t(item.tk).toUpperCase()}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function PerfumeSubNav({ active, standalone = true }: { active?: string; standalone?: boolean }) {
  const { t } = useI18n();
  return (
    <nav className={`relative z-40 border-b border-gold/15 bg-obsidian/85 backdrop-blur-xl ${standalone ? "pt-20 lg:pt-24" : ""}`}>
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-1.5 px-4 py-3 lg:px-12">
        <HomeLink />
        {PARFUM_ITEMS.map((item) => (
          <Link
            key={item.key}
            to="/shop/$category/$sub"
            params={{ category: "parfum", sub: item.key }}
            className={pillClass(active === item.key)}
          >
            {t(item.tk).toUpperCase()}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export const TECH_SUB_LINKS = TECH_ITEMS;
export const PARFUM_SUB_LINKS = PARFUM_ITEMS;

