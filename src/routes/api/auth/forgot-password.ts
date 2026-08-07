import { createFileRoute } from "@tanstack/react-router";
import { json, noContent } from "@/server/cors";
import { createPasswordResetToken } from "@/server/users";
import { sendPasswordResetEmail } from "@/server/mail";

function siteUrl(request: Request) {
  const fromEnv = process.env.SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const origin = request.headers.get("Origin");
  if (origin) return origin.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export const Route = createFileRoute("/api/auth/forgot-password")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const email = String(body?.email ?? "");
          if (!email.trim()) {
            return json({ error: "Email is required" }, request, { status: 400 });
          }
          // Always return success to avoid email enumeration
          const result = await createPasswordResetToken(email);
          if (result) {
            const resetUrl = `${siteUrl(request)}/reset-password?token=${result.token}`;
            try {
              await sendPasswordResetEmail(result.user.email, resetUrl);
            } catch (err) {
              console.error("[auth/forgot] reset email failed:", err);
              return json(
                { error: "Could not send reset email. Try again later." },
                request,
                { status: 502 },
              );
            }
          }
          return json(
            {
              message:
                "If an account exists for that email, a reset link has been sent.",
            },
            request,
          );
        } catch (e) {
          console.error(e);
          return json({ error: "Request failed" }, request, { status: 500 });
        }
      },
    },
  },
});
