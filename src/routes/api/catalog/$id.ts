import { createFileRoute } from "@tanstack/react-router";
import { assertAdminKey, json, noContent } from "@/server/cors";
import { deleteProduct, getProductById, upsertProduct } from "@/server/catalog";

export const Route = createFileRoute("/api/catalog/$id")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      GET: async ({ request, params }) => {
        const product = await getProductById(params.id);
        if (!product) return json({ error: "Not found" }, request, { status: 404 });
        const url = new URL(request.url);
        if (url.searchParams.get("public") === "1" && product.status !== "published") {
          return json({ error: "Not found" }, request, { status: 404 });
        }
        return json({ product }, request);
      },
      PUT: async ({ request, params }) => {
        const denied = assertAdminKey(request);
        if (denied) return denied;
        try {
          const body = await request.json();
          const existing = await getProductById(params.id);
          if (!existing) {
            return json({ error: "Not found" }, request, { status: 404 });
          }
          const product = await upsertProduct({
            ...existing,
            ...body,
            id: params.id,
          });
          return json({ product, message: "Saved — live on website" }, request);
        } catch (e) {
          console.error(e);
          return json({ error: "Invalid request body" }, request, { status: 400 });
        }
      },
      DELETE: async ({ request, params }) => {
        const denied = assertAdminKey(request);
        if (denied) return denied;
        const ok = await deleteProduct(params.id);
        if (!ok) return json({ error: "Not found" }, request, { status: 404 });
        return json({ ok: true, message: "Deleted — removed from website" }, request);
      },
    },
  },
});
