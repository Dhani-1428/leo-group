import { createFileRoute } from "@tanstack/react-router";
import { json, noContent } from "@/server/cors";
import { getProductById } from "@/server/catalog";
import {
  getStripe,
  integrationIdentifier,
  siteUrlFromRequest,
  stripeConfigured,
  type CheckoutLineInput,
} from "@/server/stripe";

export const Route = createFileRoute("/api/checkout/create-session")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => noContent(request),
      POST: async ({ request }) => {
        try {
          if (!stripeConfigured()) {
            return json(
              {
                error:
                  "Payments are not configured. Add STRIPE_SECRET_KEY to the server environment.",
              },
              request,
              { status: 503 },
            );
          }

          const body = await request.json();
          const items = (Array.isArray(body?.items) ? body.items : []) as CheckoutLineInput[];
          const customerEmail =
            typeof body?.customerEmail === "string" && body.customerEmail.trim()
              ? body.customerEmail.trim().toLowerCase()
              : undefined;

          if (!items.length) {
            return json({ error: "Your bag is empty." }, request, { status: 400 });
          }

          const line_items: Array<{
            quantity: number;
            price_data: {
              currency: string;
              unit_amount: number;
              product_data: {
                name: string;
                description?: string;
                images?: string[];
                metadata?: Record<string, string>;
              };
            };
          }> = [];

          for (const item of items) {
            const productId = String(item?.productId ?? "").trim();
            const qty = Math.max(1, Math.min(99, Math.floor(Number(item?.qty) || 1)));
            if (!productId) {
              return json({ error: "Invalid cart item." }, request, { status: 400 });
            }

            const product = await getProductById(productId);
            if (!product) {
              return json(
                { error: `Product not found: ${productId}` },
                request,
                { status: 400 },
              );
            }
            if (product.status && product.status !== "published") {
              return json(
                { error: `${product.name} is not available for purchase.` },
                request,
                { status: 400 },
              );
            }
            const availability = product.availability ?? [];
            if (
              availability.length > 0 &&
              availability.includes("unavailable") &&
              !availability.includes("online")
            ) {
              return json(
                { error: `${product.name} is not available online.` },
                request,
                { status: 400 },
              );
            }
            if (typeof product.stock === "number" && product.stock < qty) {
              return json(
                { error: `Not enough stock for ${product.name}.` },
                request,
                { status: 400 },
              );
            }

            const unitAmount = Math.round(Number(product.price) * 100);
            if (!Number.isFinite(unitAmount) || unitAmount < 50) {
              return json(
                { error: `Invalid price for ${product.name}.` },
                request,
                { status: 400 },
              );
            }

            const variant =
              typeof item.variant === "string" && item.variant.trim()
                ? item.variant.trim()
                : undefined;
            const image = product.images?.[0];
            // Stripe requires publicly reachable HTTPS image URLs
            const absoluteImage =
              image && /^https:\/\//i.test(image)
                ? image
                : image && !image.startsWith("data:")
                  ? `${siteUrlFromRequest(request)}${image.startsWith("/") ? "" : "/"}${image}`
                  : undefined;
            const checkoutImage =
              absoluteImage && /^https:\/\//i.test(absoluteImage) ? absoluteImage : undefined;

            line_items.push({
              quantity: qty,
              price_data: {
                currency: "eur",
                unit_amount: unitAmount,
                product_data: {
                  name: product.name,
                  description: [product.line, variant].filter(Boolean).join(" · ") || undefined,
                  images: checkoutImage ? [checkoutImage] : undefined,
                  metadata: {
                    productId: product.id,
                    ...(variant ? { variant } : {}),
                  },
                },
              },
            });
          }

          const site = siteUrlFromRequest(request);
          const stripe = getStripe();
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items,
            success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${site}/checkout/cancel`,
            locale: "auto",
            billing_address_collection: "required",
            shipping_address_collection: {
              allowed_countries: ["PT", "ES", "FR", "DE", "IT", "NL", "BE", "GB", "US"],
            },
            phone_number_collection: { enabled: true },
            customer_email: customerEmail,
            integration_identifier: integrationIdentifier(),
            metadata: {
              source: "maison-aurum",
              business: "leoworld.pt",
            },
          });

          if (!session.url) {
            return json(
              { error: "Could not create checkout URL." },
              request,
              { status: 502 },
            );
          }

          return json({ url: session.url, sessionId: session.id }, request);
        } catch (e) {
          console.error("[checkout/create-session]", e);
          const message = e instanceof Error ? e.message : "Checkout failed";
          return json({ error: message }, request, { status: 500 });
        }
      },
    },
  },
});
