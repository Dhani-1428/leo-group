import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders } from "@/server/cors";
import { readUpload } from "@/server/uploads";

export const Route = createFileRoute("/api/uploads/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const filename = params._splat || "";
        const file = await readUpload(filename);
        if (!file) {
          return new Response("Not found", {
            status: 404,
            headers: corsHeaders(request),
          });
        }
        return new Response(new Uint8Array(file.data), {
          status: 200,
          headers: {
            ...corsHeaders(request),
            "Content-Type": file.contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
