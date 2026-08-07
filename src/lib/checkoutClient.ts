import type { BagItem } from "@/lib/bagStore";

export async function startCheckout(items: BagItem[], customerEmail?: string | null) {
  const res = await fetch("/api/checkout/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
        variant: i.variant,
      })),
      customerEmail: customerEmail || undefined,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Checkout failed (${res.status})`);
  }
  const url = (data as { url?: string }).url;
  if (!url) throw new Error("No checkout URL returned");
  return url;
}

export async function fetchCheckoutSession(sessionId: string) {
  const res = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Could not load session (${res.status})`);
  }
  return data as {
    id: string;
    status: string | null;
    paymentStatus: string;
    customerEmail: string | null;
    amountTotal: number | null;
    currency: string | null;
  };
}
