"use client";
import { useState } from "react";

export function ImageUpload({
  value,
  onChange,
  rounded,
}: {
  value: string;
  onChange: (url: string) => void;
  rounded?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Upload failed");
      return;
    }
    const d = await res.json();
    if (d?.url) onChange(d.url);
  }

  return (
    <div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className={`mb-2 h-20 w-20 border border-line object-cover ${rounded ? "rounded-full" : "rounded-xl"}`}
        />
      )}
      <input type="file" accept="image/*" onChange={onFile} className="block text-sm text-muted" />
      {loading && <p className="mt-1 text-xs text-faint">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-clay-dark">{error}</p>}
      {value && (
        <button type="button" onClick={() => onChange("")} className="mt-1 text-xs text-faint hover:text-clay-dark">
          Remove image
        </button>
      )}
    </div>
  );
}
