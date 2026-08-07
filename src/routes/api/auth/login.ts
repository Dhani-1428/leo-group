import { createFileRoute } from "@tanstack/react-router";
import { json, noContent } from "@/server/cors";
import { authenticateUser, publicUser } from "@/server/users";
import { sendLoginEmail } from "@/server/mail";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const email = String(body?.email ?? "");
          const password = String(body?.password ?? "");
          if (!email || !password) {
            return json({ error: "Email and password are required" }, request, {
              status: 400,
            });
          }
          const user = await authenticateUser(email, password);
          if (!user) {
            return json({ error: "Invalid email or password" }, request, {
              status: 401,
            });
          }
          try {
            await sendLoginEmail(user.email);
          } catch (err) {
            console.error("[auth/login] login email failed:", err);
          }
          return json({ user: publicUser(user), message: "Signed in" }, request);
        } catch (e) {
          console.error(e);
          return json({ error: "Login failed" }, request, { status: 500 });
        }
      },
    },
  },
});
