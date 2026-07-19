import { createFileRoute } from "@tanstack/react-router";
import { assertAdminKey, json, noContent, corsHeaders } from "@/server/cors";
import { saveUpload } from "@/server/uploads";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      POST: async ({ request }) => {
        const denied = assertAdminKey(request);
        if (denied) return denied;
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return json({ error: "Missing file field" }, request, { status: 400 });
          }
          const saved = await saveUpload(file);
          return json(
            { url: saved.url, filename: saved.filename, message: "Uploaded" },
            request,
            { status: 201 },
          );
        } catch (e) {
          console.error(e);
          return json(
            { error: e instanceof Error ? e.message : "Upload failed" },
            request,
            { status: 400 },
          );
        }
      },
    },
  },
});
