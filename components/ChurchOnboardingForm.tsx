"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

export default function ChurchOnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    churchName: "",
    churchCity: "",
    title: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/church-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setBusy(false);
        return;
      }
      router.push("/leader");
      router.refresh();
    } catch {
      setError("Could not submit. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={ui.label}>Your full name</span>
          <input required className={ui.input} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </label>
        <label className="block">
          <span className={ui.label}>Your role at the church</span>
          <input className={ui.input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Pastor, Elder" />
        </label>
      </div>
      <label className="block">
        <span className={ui.label}>Email address</span>
        <input required type="email" className={ui.input} value={form.email} onChange={(e) => set("email", e.target.value)} />
      </label>
      <label className="block">
        <span className={ui.label}>Password</span>
        <input required type="password" minLength={8} className={ui.input} value={form.password} onChange={(e) => set("password", e.target.value)} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={ui.label}>Church name</span>
          <input required className={ui.input} value={form.churchName} onChange={(e) => set("churchName", e.target.value)} />
        </label>
        <label className="block">
          <span className={ui.label}>Church city</span>
          <input className={ui.input} value={form.churchCity} onChange={(e) => set("churchCity", e.target.value)} />
        </label>
      </div>
      <label className="block">
        <span className={ui.label}>Anything that helps us confirm you (optional)</span>
        <textarea rows={3} className={ui.input} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="A church website, your position, or how we can verify you lead this church." />
      </label>

      {error && <p className="text-sm text-clay-dark">{error}</p>}

      <button type="submit" disabled={busy} className={`w-full ${ui.btnPrimary}`}>
        {busy ? "Submitting…" : "Onboard my church"}
      </button>
      <p className="text-center text-xs text-faint">
        We confirm every church leader before your invite tools unlock. You&rsquo;ll be able to prepare in the meantime.
      </p>
    </form>
  );
}
