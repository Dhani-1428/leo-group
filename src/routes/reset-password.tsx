import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: "Reset password — LEO GROUP" }],
  }),
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-28">
      <h1 className="font-display text-3xl tracking-[0.15em]">Reset password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Choose a new password for your LEO GROUP account.
      </p>

      {done ? (
        <div className="mt-10 space-y-4">
          <p className="text-sm text-gold">Password updated. You can sign in now.</p>
          <Link to="/" className="inline-block text-[11px] tracking-[0.3em] text-foreground hover:text-gold">
            ← BACK HOME
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 space-y-4">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div>
            <label className="mb-2 block text-[10px] tracking-[0.3em] text-gold/80">NEW PASSWORD</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-gold/25 bg-obsidian-2/60 px-4 py-3 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] tracking-[0.3em] text-gold/80">CONFIRM PASSWORD</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-full border border-gold/25 bg-obsidian-2/60 px-4 py-3 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !token}
            className="w-full rounded-full bg-gold-gradient py-4 text-[11px] font-semibold tracking-[0.3em] text-obsidian disabled:opacity-50"
          >
            {busy ? "SAVING…" : "UPDATE PASSWORD"}
          </button>
        </form>
      )}
    </main>
  );
}
