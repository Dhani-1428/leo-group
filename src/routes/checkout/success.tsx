import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useBagStore } from "@/lib/bagStore";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : "",
  }),
  component: CheckoutSuccessPage,
  head: () => ({
    meta: [{ title: "Order confirmed — LEO GROUP" }],
  }),
});

function CheckoutSuccessPage() {
  const { session_id } = Route.useSearch();
  const clearBag = useBagStore((s) => s.clearBag);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<{
    paymentStatus: string;
    customerEmail: string | null;
    amountTotal: number | null;
    currency: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session_id) {
        setError("Missing checkout session.");
        setLoading(false);
        return;
      }
      try {
        const { fetchCheckoutSession } = await import("@/lib/checkoutClient");
        const session = await fetchCheckoutSession(session_id);
        if (cancelled) return;
        setInfo({
          paymentStatus: session.paymentStatus,
          customerEmail: session.customerEmail,
          amountTotal: session.amountTotal,
          currency: session.currency,
        });
        if (session.paymentStatus === "paid" || session.paymentStatus === "no_payment_required") {
          clearBag();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not confirm payment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session_id, clearBag]);

  const amount =
    info?.amountTotal != null && info.currency
      ? new Intl.NumberFormat("pt-PT", {
          style: "currency",
          currency: info.currency.toUpperCase(),
        }).format(info.amountTotal / 100)
      : null;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-28">
      <div className="text-[10px] tracking-[0.35em] text-gold/80">LEO GROUP</div>
      <h1 className="mt-3 font-display text-3xl tracking-[0.12em]">Thank you</h1>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Confirming your payment…</p>
      ) : error ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-sm text-muted-foreground">
            If you were charged, your order is still being processed. Contact{" "}
            <a href="mailto:leotechsaoworld@gmail.com" className="text-gold">
              leotechsaoworld@gmail.com
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3 text-sm text-muted-foreground">
          <p className="text-gold">
            {info?.paymentStatus === "paid" || info?.paymentStatus === "no_payment_required"
              ? "Payment received. Your order is confirmed."
              : `Payment status: ${info?.paymentStatus ?? "unknown"}.`}
          </p>
          {amount && <p>Total: {amount}</p>}
          {info?.customerEmail && <p>Confirmation sent toward {info.customerEmail}.</p>}
          <p>A member of the Maison will follow up on shipping when required.</p>
        </div>
      )}

      <Link
        to="/"
        className="mt-10 inline-block text-[11px] tracking-[0.3em] text-foreground hover:text-gold"
      >
        ← BACK HOME
      </Link>
    </main>
  );
}
