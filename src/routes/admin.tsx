import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ADMIN_PANEL_URL } from "@/lib/adminPanelUrl";

/**
 * Old in-app admin removed. Always send users to maison-aurum-admin-panel.
 */
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Redirecting to Admin…" },
      { name: "robots", content: "noindex,nofollow" },
      { httpEquiv: "refresh", content: `0;url=${ADMIN_PANEL_URL}` },
    ],
  }),
  component: AdminRedirect,
});

function AdminRedirect() {
  useEffect(() => {
    window.location.replace(ADMIN_PANEL_URL);
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-obsidian px-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">
          Opening admin panel…
        </p>
        <a
          href={ADMIN_PANEL_URL}
          className="mt-6 inline-block text-amber-200 underline underline-offset-4"
        >
          Continue to admin
        </a>
      </div>
    </div>
  );
}
