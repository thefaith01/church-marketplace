"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

type Props = {
  initial: {
    churchReferenceName: string;
    churchReferenceCity: string;
    churchReferencePerson: string;
  };
  hasExistingDoc: boolean;
  status: string;
};

export function EditChurchForm({ initial, hasExistingDoc, status }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const body = new FormData();
    body.append("churchReferenceName", form.churchReferenceName);
    body.append("churchReferenceCity", form.churchReferenceCity);
    body.append("churchReferencePerson", form.churchReferencePerson);
    if (file) body.append("churchReferenceLetter", file);

    const res = await fetch("/api/verification", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded-[20px] border border-[#CBD7C2] bg-sage p-6">
        <p className="font-display font-bold text-forest">Submitted for review</p>
        <p className="mt-1 text-sm text-[#3C5040]">
          Your details have been sent to a Platform Admin. You'll get access to
          the marketplace once your church connection is confirmed.
        </p>
        <a href="/dashboard" className={`mt-4 ${ui.btnPrimary}`}>Back to dashboard</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "VERIFIED" ? (
        <div className="rounded-xl bg-sage p-3 text-sm text-forest">
          You're already verified. You can still update your church details below.
        </div>
      ) : (
        <div className="rounded-xl bg-[#F4E7CE] p-3 text-sm text-[#8A6420]">
          Add or update your church details and upload a reference document if you
          have one. Submitting sends your account to an admin for review.
        </div>
      )}

      <label className="block">
        <span className={ui.label}>Church name</span>
        <input className={ui.input} value={form.churchReferenceName} onChange={(e) => set("churchReferenceName", e.target.value)} placeholder="e.g. Grace Community Church" />
      </label>
      <label className="block">
        <span className={ui.label}>Church city</span>
        <input className={ui.input} value={form.churchReferenceCity} onChange={(e) => set("churchReferenceCity", e.target.value)} placeholder="e.g. Croydon" />
      </label>
      <label className="block">
        <span className={ui.label}>Reference person (pastor or elder)</span>
        <input className={ui.input} value={form.churchReferencePerson} onChange={(e) => set("churchReferencePerson", e.target.value)} placeholder="e.g. Pastor John Smith" />
      </label>
      <label className="block">
        <span className={ui.label}>Reference document (PDF or image)</span>
        <input type="file" accept=".pdf,image/*" className="mt-1 block text-sm text-muted" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {hasExistingDoc && (
          <span className="mt-1 block text-xs text-faint">
            A document is already on file. Uploading a new one replaces it.
          </span>
        )}
      </label>

      {error && <p className="text-sm text-clay-dark">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className={ui.btnPrimary}>
          {loading ? "Submitting…" : "Submit for review"}
        </button>
        <a href="/dashboard" className={ui.btnGhost}>Cancel</a>
      </div>
    </form>
  );
}
