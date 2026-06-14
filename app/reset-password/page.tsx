"use client";
import { useState } from "react";
import { ui, Arch } from "@/components/ui";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Always acknowledge without revealing whether an account exists.
    await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-[24px] border border-line bg-paper p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Arch />
          <span className="font-display text-xl font-extrabold text-ink">cmm</span>
        </div>
        <h1 className="mt-5 font-display text-[28px] font-bold tracking-[-0.02em] text-ink">Reset password</h1>

        {submitted ? (
          <div className="mt-6 rounded-xl bg-chip p-4 text-sm text-[#5A4F40]">
            If an account exists for <strong>{email}</strong>, we've sent reset
            instructions. Check your inbox (and spam). The link expires in an hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <p className="text-sm text-muted">
              Enter your email and we'll send a link to set a new password.
            </p>
            <label className="block">
              <span className={ui.label}>Email</span>
              <input required type="email" className={ui.input} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button type="submit" disabled={loading} className={`w-full ${ui.btnPrimary}`}>
              {loading ? "Sending…" : "Send reset link"}
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
