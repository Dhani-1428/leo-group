import { createFileRoute } from "@tanstack/react-router";
import { assertAdminKey, json, noContent } from "@/server/cors";
import { listProducts, upsertProduct } from "@/server/catalog";

export const Route = createFileRoute("/api/catalog")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const publicOnly = url.searchParams.get("public") === "1";
        const products = await listProducts({ publicOnly });
        return json({ products }, request);
      },
      POST: async ({ request }) => {
        const denied = assertAdminKey(request);
        if (denied) return denied;
        try {
          const body = await request.json();
          if (!body?.id || !body?.name || !body?.category) {
            return json(
              { error: "id, name, and category are required" },
              request,
              { status: 400 },
            );
          }
          if (body.category !== "parfum" && body.category !== "tech") {
            return json({ error: "category must be parfum or tech" }, request, {
              status: 400,
            });
          }
          const existing = (await listProducts()).find((p) => p.id === body.id);
          if (existing) {
            return json({ error: "Product id already exists" }, request, {
              status: 409,
            });
          }
          const product = await upsertProduct(body);
          return json({ product, message: "Saved — live on website" }, request, {
            status: 201,
          });
        } catch (e) {
          console.error(e);
          return json({ error: "Invalid request body" }, request, { status: 400 });
        }
      },
    },
  },
});
