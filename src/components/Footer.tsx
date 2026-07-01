import { Link } from "@tanstack/react-router";
import { Truck, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCategory } from "@/lib/categoryContext";

export function Footer() {
  const { t } = useI18n();
  const { category } = useCategory();
  const isPerfume = category === "parfum";
  const brandSuffix = isPerfume ? "SIGNATURE" : "TECH HUB";
  const tagline = isPerfume ? t("footer.tagline.parfum") : t("footer.tagline.tech");

  const cols = isPerfume
    ? [
        { t: t("footer.col.maison"), l: [t("footer.extraits"), t("footer.eau"), t("footer.limited"), t("footer.discovery")] },
        { t: t("footer.col.account"), l: [t("footer.signin"), t("footer.orders"), t("footer.wishlist"), t("footer.members")] },
        { t: t("footer.col.cared"), l: [t("footer.contact"), t("footer.shipping"), t("footer.returns"), t("footer.faq")] },
      ]
    : [
        { t: t("footer.col.studio"), l: [t("footer.audio"), t("footer.cases"), t("footer.charging"), t("footer.horology")] },
        { t: t("footer.col.account"), l: [t("footer.signin"), t("footer.orders"), t("footer.wishlist"), t("footer.members")] },
        { t: t("footer.col.cared"), l: [t("footer.contact"), t("footer.shipping"), t("footer.returns"), t("footer.faq")] },
      ];
  return (
    <footer className="border-t border-gold/15 bg-obsidian-2 pt-24 pb-10 mt-32 [.theme-tech_&]:bg-sky-50 [.theme-tech_&]:border-blue-200">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-16 grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="font-display text-2xl tracking-[0.4em] [.theme-tech_&]:text-blue-700">
              LEO <span className="text-gold-gradient [.theme-tech_&]:!bg-none [.theme-tech_&]:!text-blue-600">{brandSuffix}</span>
            </div>
            <p className="mt-6 max-w-xs text-sm text-muted-foreground [.theme-tech_&]:text-blue-900/70">{tagline}</p>
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground [.theme-tech_&]:text-blue-900/70">
              <span className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-gold [.theme-tech_&]:text-blue-600" /> {t("footer.free")}</span>
              <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-gold [.theme-tech_&]:text-blue-600" /> {t("footer.lifetime")}</span>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.t}>
              <div className="mb-5 text-[10px] tracking-[0.4em] text-gold [.theme-tech_&]:text-blue-600">{c.t.toUpperCase()}</div>
              <ul className="space-y-3 text-sm text-muted-foreground [.theme-tech_&]:text-blue-900/70">
                {c.l.map((i) => (
                  <li key={i}><a href="#" className="hover:text-gold transition-colors [.theme-tech_&]:hover:text-blue-600">{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gold/10 pt-8 text-xs text-muted-foreground md:flex-row [.theme-tech_&]:border-blue-200 [.theme-tech_&]:text-blue-900/70">
          <div>© {new Date().getFullYear()} LEO {brandSuffix}. {t("footer.rights")}</div>
          <div className="text-center tracking-[0.2em] text-gold [.theme-tech_&]:text-blue-600">
            {t("footer.designedby")}
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold [.theme-tech_&]:hover:text-blue-600">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-gold [.theme-tech_&]:hover:text-blue-600">{t("footer.terms")}</a>
            <Link to="/admin" className="hover:text-gold [.theme-tech_&]:hover:text-blue-600">{t("nav.admin")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
