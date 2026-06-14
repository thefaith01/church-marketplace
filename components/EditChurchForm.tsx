"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const inp =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (done) {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 p-6">
        <p className="font-semibold text-green-900">Submitted for review</p>
        <p className="mt-1 text-sm text-green-800">
          Your details have been sent to a Platform Admin. You'll get access to
          the marketplace once your church connection is confirmed.
        </p>
        <a
          href="/dashboard"
          className="mt-4 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Back to dashboard
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "VERIFIED" ? (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          You're already verified. You can still update your church details
          below.
        </div>
      ) : (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Add or update your church details and upload a reference document if
          you have one. Submitting sends your account to an admin for review.
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Church name</span>
        <input
          className={inp}
          value={form.churchReferenceName}
          onChange={(e) => set("churchReferenceName", e.target.value)}
          placeholder="e.g. Grace Community Church"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Church city</span>
        <input
          className={inp}
          value={form.churchReferenceCity}
          onChange={(e) => set("churchReferenceCity", e.target.value)}
          placeholder="e.g. Dallas"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Reference person (pastor or elder)
        </span>
        <input
          className={inp}
          value={form.churchReferencePerson}
          onChange={(e) => set("churchReferencePerson", e.target.value)}
          placeholder="e.g. Pastor John Smith"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Reference document (PDF or image)
        </span>
        <input
          type="file"
          accept=".pdf,image/*"
          className="mt-1 block text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {hasExistingDoc && (
          <span className="mt-1 block text-xs text-gray-400">
            A document is already on file. Uploading a new one replaces it.
          </span>
        )}
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-800"
        >
          {loading ? "Submitting…" : "Submit for review"}
        </button>
        <a
          href="/dashboard"
          className="rounded-md border px-5 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
