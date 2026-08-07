import { createFileRoute } from "@tanstack/react-router";
import { fulfillCheckout, getStripe } from "@/server/stripe";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!secret) {
          console.error("[webhooks/stripe] STRIPE_WEBHOOK_SECRET is not set");
          return new Response("Webhook secret not configured", { status: 503 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("Missing stripe-signature", { status: 400 });
        }

        const payload = await request.text();
        let event;
        try {
          const stripe = getStripe();
          event = stripe.webhooks.constructEvent(payload, signature, secret);
        } catch (err) {
          console.error("[webhooks/stripe] signature verification failed:", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as { id: string; payment_status?: string };
              // Instant methods are paid; delayed methods may still be processing
              if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
                await fulfillCheckout(session.id);
              }
              break;
            }
            case "checkout.session.async_payment_succeeded": {
              const session = event.data.object as { id: string };
              await fulfillCheckout(session.id);
              break;
            }
            case "checkout.session.async_payment_failed": {
              const session = event.data.object as { id: string };
              console.warn("[webhooks/stripe] async payment failed:", session.id);
              break;
            }
            default:
              break;
          }
        } catch (err) {
          console.error("[webhooks/stripe] handler error:", err);
          return new Response("Webhook handler failed", { status: 500 });
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
