"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

export function ProfileForm({
  initial,
}: {
  initial: { fullName: string; bio: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className={ui.label}>Full name</span>
        <input required className={ui.input} value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
      </label>
      <label className="block">
        <span className={ui.label}>About you</span>
        <textarea
          rows={5}
          className={ui.input}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="Share a short bio. Members see this on your provider profile."
        />
      </label>
      {error && <p className="text-sm text-clay-dark">{error}</p>}
      {saved && <p className="text-sm text-forest">Saved.</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className={ui.btnPrimary}>
          {loading ? "Saving…" : "Save profile"}
        </button>
        <a href="/dashboard" className={ui.btnGhost}>Done</a>
      </div>
    </form>
  );
}
