/**
 * Standalone Next.js admin — maison-aurum-admin-panel only.
 * Set VITE_ADMIN_PANEL_URL to override (e.g. http://localhost:3000 for local).
 */
export const ADMIN_PANEL_URL = (
  (import.meta.env.VITE_ADMIN_PANEL_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://maison-aurum-admin-panel.vercel.app"
);

/** @deprecated use ADMIN_PANEL_URL */
export function getAdminPanelUrl() {
  return ADMIN_PANEL_URL;
}
