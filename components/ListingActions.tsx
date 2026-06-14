"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

export function ListingActions({
  listingId,
  providerId,
}: {
  listingId: string;
  providerId: string;
}) {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [requestedDateText, setRequestedDateText] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, jobDescription, requestedDateText }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not send request");
      return;
    }
    setDone(true);
  }

  async function messageProvider() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: providerId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not open conversation");
      return;
    }
    router.push(`/messages/${data.id}`);
  }

  if (done) {
    return (
      <div className="rounded-[20px] border border-[#CBD7C2] bg-sage p-5">
        <p className="font-display font-bold text-forest">Request sent</p>
        <p className="mt-1 text-sm text-[#3C5040]">
          The provider has been notified. You can follow up in your messages.
        </p>
        <a href="/manage" className={`mt-4 ${ui.btnPrimary}`}>View my bookings</a>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-line bg-paper p-5 shadow-sm">
      <h2 className="font-display text-base font-bold text-ink">Request this service</h2>
      <form onSubmit={submitBooking} className="mt-4 space-y-3">
        <label className="block">
          <span className={ui.label}>What do you need?</span>
          <textarea required rows={4} className={ui.input} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Describe the job or request." />
        </label>
        <label className="block">
          <span className={ui.label}>Preferred date (optional)</span>
          <input className={ui.input} value={requestedDateText} onChange={(e) => setRequestedDateText(e.target.value)} placeholder="e.g. Next Saturday morning" />
        </label>
        {error && <p className="text-sm text-clay-dark">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={loading} className={ui.btnPrimary}>
            {loading ? "Sending…" : "Send booking request"}
          </button>
          <button type="button" onClick={messageProvider} disabled={loading} className={ui.btnGhost}>
            Message provider
          </button>
        </div>
      </form>
    </div>
  );
}
