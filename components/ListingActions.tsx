"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const inp =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (done) {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 p-5">
        <p className="font-semibold text-green-900">Request sent</p>
        <p className="mt-1 text-sm text-green-800">
          The provider has been notified. You can follow up in your messages.
        </p>
        <a
          href="/manage"
          className="mt-4 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          View my bookings
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800">Request this service</h2>
      <form onSubmit={submitBooking} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            What do you need?
          </span>
          <textarea
            required
            rows={4}
            className={inp}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Describe the job or request."
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Preferred date (optional)
          </span>
          <input
            className={inp}
            value={requestedDateText}
            onChange={(e) => setRequestedDateText(e.target.value)}
            placeholder="e.g. Next Saturday morning"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-800"
          >
            {loading ? "Sending…" : "Send booking request"}
          </button>
          <button
            type="button"
            onClick={messageProvider}
            disabled={loading}
            className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Message provider
          </button>
        </div>
      </form>
    </div>
  );
}
