"use client";
import { useState } from "react";
import { ui } from "@/components/ui";

export function ReportButton({
  listingId,
  reportedUserId,
}: {
  listingId?: string;
  reportedUserId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Inappropriate content");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, reportedUserId, reason, details }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not submit report");
      return;
    }
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return <p className="text-xs text-forest">Reported. An admin will review it.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-faint hover:text-clay-dark"
      >
        Report
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-2 rounded-xl border border-line bg-paper p-3">
      <select className={ui.input} value={reason} onChange={(e) => setReason(e.target.value)}>
        <option>Inappropriate content</option>
        <option>Spam or scam</option>
        <option>Not a genuine church member</option>
        <option>Other</option>
      </select>
      <textarea
        className={ui.input}
        rows={2}
        placeholder="Optional details"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      {error && <p className="text-xs text-clay-dark">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-clay px-3 py-1 text-xs font-semibold text-paper disabled:opacity-50 hover:bg-clay-dark"
        >
          {loading ? "Sending…" : "Submit report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink hover:bg-chip"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
