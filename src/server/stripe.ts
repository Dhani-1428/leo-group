import Stripe from "stripe";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { dbConfigured, ensureSchema, getPool, type RowDataPacket } from "@/server/db";

let client: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function siteUrlFromRequest(request: Request) {
  const fromEnv = process.env.SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const origin = request.headers.get("Origin");
  if (origin) return origin.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export function integrationIdentifier() {
  const suffix = randomBytes(4).toString("hex");
  return `leo_hosted_${suffix}`;
}

export type CheckoutLineInput = {
  productId: string;
  qty: number;
  variant?: string;
};

type FulfilledOrder = {
  sessionId: string;
  paymentStatus: string;
  customerEmail: string | null;
  amountTotal: number | null;
  currency: string | null;
  lineItems: Array<{
    id: string | null;
    name: string | null;
    quantity: number | null;
    amountTotal: number | null;
  }>;
  fulfilledAt: string;
};

const ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");
let orderCache: FulfilledOrder[] | null = null;

async function loadOrdersFile(): Promise<FulfilledOrder[]> {
  if (orderCache) return orderCache;
  try {
    const raw = await fs.readFile(ORDERS_PATH, "utf-8");
    orderCache = JSON.parse(raw) as FulfilledOrder[];
  } catch {
    orderCache = [];
  }
  return orderCache;
}

async function saveOrdersFile(orders: FulfilledOrder[]) {
  orderCache = orders;
  try {
    await fs.mkdir(path.dirname(ORDERS_PATH), { recursive: true });
    await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.warn("[orders] file persistence unavailable:", err);
  }
}

export async function isOrderFulfilled(sessionId: string) {
  if (dbConfigured()) {
    try {
      await ensureSchema();
      const [rows] = await getPool().query<RowDataPacket[]>(
        "SELECT session_id FROM orders WHERE session_id = ? LIMIT 1",
        [sessionId],
      );
      if (rows.length) return true;
    } catch (err) {
      console.warn("[orders] MySQL check failed, falling back to file:", err);
    }
  }
  const orders = await loadOrdersFile();
  return orders.some((o) => o.sessionId === sessionId);
}

/** Idempotent fulfillment for a paid Checkout Session. */
export async function fulfillCheckout(sessionId: string) {
  if (!sessionId) return { skipped: true as const, reason: "missing_session" };
  if (await isOrderFulfilled(sessionId)) {
    return { skipped: true as const, reason: "already_fulfilled" };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return { skipped: true as const, reason: "not_paid", paymentStatus: session.payment_status };
  }

  const lineItems =
    session.line_items?.data.map((li) => ({
      id: li.price?.product?.toString() ?? li.id ?? null,
      name: li.description ?? null,
      quantity: li.quantity ?? null,
      amountTotal: li.amount_total ?? null,
    })) ?? [];

  const order: FulfilledOrder = {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    amountTotal: session.amount_total,
    currency: session.currency,
    lineItems,
    fulfilledAt: new Date().toISOString(),
  };

  if (dbConfigured()) {
    try {
      await ensureSchema();
      await getPool().query(
        `INSERT IGNORE INTO orders
          (session_id, payment_status, customer_email, amount_total, currency, line_items, fulfilled_at)
         VALUES (?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
        [
          order.sessionId,
          order.paymentStatus,
          order.customerEmail,
          order.amountTotal,
          order.currency,
          JSON.stringify(order.lineItems),
          new Date(order.fulfilledAt),
        ],
      );
      console.info(
        "[checkout] fulfilled (mysql)",
        session.id,
        order.customerEmail,
        order.amountTotal,
        order.currency,
      );
      return { skipped: false as const, order };
    } catch (err) {
      console.warn("[orders] MySQL save failed, falling back to file:", err);
    }
  }

  const orders = await loadOrdersFile();
  if (orders.some((o) => o.sessionId === sessionId)) {
    return { skipped: true as const, reason: "already_fulfilled" };
  }
  await saveOrdersFile([order, ...orders]);

  console.info(
    "[checkout] fulfilled",
    session.id,
    order.customerEmail,
    order.amountTotal,
    order.currency,
  );

  return { skipped: false as const, order };
}
