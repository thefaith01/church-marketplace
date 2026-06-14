"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui, Arch } from "@/components/ui";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-[24px] border border-line bg-paper p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Arch />
          <span className="font-display text-xl font-extrabold text-ink">cmm</span>
        </div>
        <h1 className="mt-5 font-display text-[28px] font-bold tracking-[-0.02em] text-ink">Set a new password</h1>

        {done ? (
          <div className="mt-6 rounded-xl bg-sage p-4 text-sm text-forest">
            Your password has been updated. You can now log in with it.
            <div className="mt-4">
              <button onClick={() => router.push("/login")} className={ui.btnPrimary}>Go to log in</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className={ui.label}>New password</span>
              <input required type="password" minLength={8} className={ui.input} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="block">
              <span className={ui.label}>Confirm password</span>
              <input required type="password" minLength={8} className={ui.input} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            {error && <p className="text-sm text-clay-dark">{error}</p>}
            <button type="submit" disabled={loading} className={`w-full ${ui.btnPrimary}`}>
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-muted">
          <a href="/login" className={ui.link}>Back to log in</a>
        </p>
      </div>
    </div>
  );
}
