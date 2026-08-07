import { createFileRoute } from "@tanstack/react-router";
import { json, noContent } from "@/server/cors";
import { createUser, publicUser } from "@/server/users";
import { sendWelcomeEmail } from "@/server/mail";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const email = String(body?.email ?? "");
          const password = String(body?.password ?? "");
          const name = body?.name ? String(body.name) : undefined;
          const user = await createUser({ email, password, name });
          try {
            await sendWelcomeEmail(user.email, user.name);
          } catch (err) {
            console.error("[auth/register] welcome email failed:", err);
          }
          return json(
            { user: publicUser(user), message: "Account created" },
            request,
            { status: 201 },
          );
        } catch (e) {
          const message = e instanceof Error ? e.message : "Registration failed";
          const status = message.includes("already exists") ? 409 : 400;
          return json({ error: message }, request, { status });
        }
      },
    },
  },
});
