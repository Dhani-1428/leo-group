import { createFileRoute } from "@tanstack/react-router";
import { json, noContent } from "@/server/cors";
import { getStripe, stripeConfigured } from "@/server/stripe";

export const Route = createFileRoute("/api/checkout/session")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      GET: async ({ request }) => {
        try {
          if (!stripeConfigured()) {
            return json({ error: "Payments are not configured." }, request, {
              status: 503,
            });
          }
          const url = new URL(request.url);
          const sessionId = url.searchParams.get("session_id")?.trim();
          if (!sessionId || !sessionId.startsWith("cs_")) {
            return json({ error: "Missing or invalid session_id." }, request, {
              status: 400,
            });
          }

          const stripe = getStripe();
          const session = await stripe.checkout.sessions.retrieve(sessionId);

          return json(
            {
              id: session.id,
              status: session.status,
              paymentStatus: session.payment_status,
              customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
              amountTotal: session.amount_total,
              currency: session.currency,
            },
            request,
          );
        } catch (e) {
          console.error("[checkout/session]", e);
          return json({ error: "Could not load checkout session." }, request, {
            status: 500,
          });
        }
      },
    },
  },
});
