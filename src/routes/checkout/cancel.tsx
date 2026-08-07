import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/cancel")({
  component: CheckoutCancelPage,
  head: () => ({
    meta: [{ title: "Checkout cancelled — LEO GROUP" }],
  }),
});

function CheckoutCancelPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-28">
      <div className="text-[10px] tracking-[0.35em] text-gold/80">LEO GROUP</div>
      <h1 className="mt-3 font-display text-3xl tracking-[0.12em]">Checkout cancelled</h1>
      <p className="mt-6 text-sm text-muted-foreground">
        No charge was made. Your bag is still waiting whenever you’re ready.
      </p>
      <Link
        to="/"
        className="mt-10 inline-block text-[11px] tracking-[0.3em] text-foreground hover:text-gold"
      >
        ← CONTINUE SHOPPING
      </Link>
    </main>
  );
}
