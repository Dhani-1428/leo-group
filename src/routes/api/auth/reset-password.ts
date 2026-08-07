import { createFileRoute } from "@tanstack/react-router";
import { json, noContent } from "@/server/cors";
import { publicUser, resetPasswordWithToken } from "@/server/users";

export const Route = createFileRoute("/api/auth/reset-password")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const token = String(body?.token ?? "");
          const password = String(body?.password ?? "");
          const user = await resetPasswordWithToken(token, password);
          return json(
            { user: publicUser(user), message: "Password updated" },
            request,
          );
        } catch (e) {
          const message = e instanceof Error ? e.message : "Reset failed";
          return json({ error: message }, request, { status: 400 });
        }
      },
    },
  },
});
