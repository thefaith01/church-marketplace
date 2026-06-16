"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

export default function TestimonialForm({
  bookingId,
  providerName,
}: {
  bookingId: string;
  providerName: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setBusy(false);
        return;
      }
      router.push("/manage?testimonial=thanks");
      router.refresh();
    } catch {
      setError("Could not submit. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={ui.label}>Your experience with {providerName}</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
          className={ui.input}
          placeholder="Share how it went. This is read by a moderator before it appears."
        />
        <p className="mt-1 text-xs text-faint">
          No star ratings here. A short, honest note in your own words, reviewed before posting.
        </p>
      </div>
      {error && <p className="text-sm text-clay-dark">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy || !content.trim()} className={ui.btnPrimary}>
          {busy ? "Submitting…" : "Submit testimonial"}
        </button>
        <a href="/manage" className={ui.btnGhost}>Skip</a>
      </div>
    </form>
  );
}
