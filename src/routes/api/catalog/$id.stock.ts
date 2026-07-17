import { createFileRoute } from "@tanstack/react-router";
import { assertAdminKey, json, noContent } from "@/server/cors";
import { setStock } from "@/server/catalog";

export const Route = createFileRoute("/api/catalog/$id/stock")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      PATCH: async ({ request, params }) => {
        const denied = assertAdminKey(request);
        if (denied) return denied;
        try {
          const body = await request.json();
          const stock = Number(body?.stock);
          if (!Number.isFinite(stock) || stock < 0) {
            return json({ error: "stock must be a non-negative number" }, request, {
              status: 400,
            });
          }
          const product = await setStock(params.id, stock);
          if (!product) return json({ error: "Not found" }, request, { status: 404 });
          return json({ product, message: "Stock updated — live on website" }, request);
        } catch (e) {
          console.error(e);
          return json({ error: "Invalid request body" }, request, { status: 400 });
        }
      },
    },
  },
});
