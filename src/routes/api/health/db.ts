import { createFileRoute } from "@tanstack/react-router";
import { json, noContent } from "@/server/cors";
import { pingDatabase } from "@/server/db";

export const Route = createFileRoute("/api/health/db")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      GET: async ({ request }) => {
        const result = await pingDatabase();
        return json(result, request, { status: result.ok ? 200 : 503 });
      },
    },
  },
});
