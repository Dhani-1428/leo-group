import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_PANEL_URL } from "@/lib/adminPanelUrl";

/** /admin is only a redirect to maison-aurum-admin-panel. */
export const Route = createFileRoute("/admin")({
  server: {
    handlers: {
      GET: async () =>
        Response.redirect(ADMIN_PANEL_URL, 302),
    },
  },
  head: () => ({
    meta: [
      { title: "Redirecting…" },
      { name: "robots", content: "noindex,nofollow" },
      { httpEquiv: "refresh", content: `0;url=${ADMIN_PANEL_URL}` },
    ],
  }),
  component: function AdminRedirect() {
    if (typeof window !== "undefined") {
      window.location.replace(ADMIN_PANEL_URL);
    }
    return null;
  },
});
