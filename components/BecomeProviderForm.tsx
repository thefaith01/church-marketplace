"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

export default function BecomeProviderForm({
  churchName,
}: {
  churchName?: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [churchContact, setChurchContact] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("note", note);
      fd.set("churchContact", churchContact);
      if (file) fd.set("document", file);
      const res = await fetch("/api/provider-requests", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      router.push("/dashboard?providerRequest=sent");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className={ui.label}>What services would you like to offer?</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          rows={4}
          className={ui.input}
          placeholder="e.g. Plumbing and small home repairs, weekends mostly."
        />
      </div>

      <div>
        <label className={ui.label}>
          Church contact for confirmation{" "}
          <span className="font-normal text-faint">(optional)</span>
        </label>
        <input
          value={churchContact}
          onChange={(e) => setChurchContact(e.target.value)}
          className={ui.input}
          placeholder="Email or phone of a leader who can vouch for you"
        />
        <p className="mt-1 text-xs text-faint">
          {churchName
            ? `An admin may reach out to ${churchName} to confirm your standing.`
            : "An admin may reach out to your church to confirm your standing."}
        </p>
      </div>

      <div>
        <label className={ui.label}>
          Acknowledgement document{" "}
          <span className="font-normal text-faint">(optional)</span>
        </label>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-chip file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
        />
        <p className="mt-1 text-xs text-faint">
          A note or letter from your church leader supporting this request.
        </p>
      </div>

      {error && <p className="text-sm text-clay-dark">{error}</p>}

      <button type="submit" disabled={submitting} className={ui.btnPrimary}>
        {submitting ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
