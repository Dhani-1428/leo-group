/**
 * Standalone Next.js admin (maison-aurum-admin-panel).
 * Override with VITE_ADMIN_PANEL_URL in .env if needed.
 */
export function getAdminPanelUrl() {
  const fromEnv = import.meta.env.VITE_ADMIN_PANEL_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3000";
    }
  }

  return "https://maison-aurum-admin-panel.vercel.app";
}
