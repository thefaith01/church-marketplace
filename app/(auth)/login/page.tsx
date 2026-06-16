"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui, Arch } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again in a moment.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-[24px] border border-line bg-paper p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Arch />
          <span className="font-display text-xl font-extrabold text-ink">cmm</span>
        </div>
        <h1 className="mt-5 font-display text-[28px] font-bold tracking-[-0.02em] text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to your church marketplace account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className={ui.label}>Email</span>
            <input required type="email" className={ui.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className={ui.label}>Password</span>
            <input required type="password" className={ui.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="text-sm text-clay-dark">{error}</p>}
          <button type="submit" disabled={loading} className={`w-full ${ui.btnPrimary}`}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          No account?{" "}
          <a href="/signup" className={ui.link}>Sign up</a>
          {" · "}
          <a href="/reset-password" className={ui.link}>Forgot password?</a>
        </p>
      </div>
    </div>
  );
}
