"use client";

import { useState } from "react";
import { ui } from "@/components/ui";

type Mode = "invites" | "roster" | "both";

const MODES: { value: Mode; label: string; desc: string }[] = [
  { value: "invites", label: "Send invites", desc: "Email each person an invite link to join." },
  { value: "roster", label: "Pre-approved roster", desc: "Auto-link them to your church when they sign up with a matching email." },
  { value: "both", label: "Both", desc: "Send invites now and keep them on the roster." },
];

export default function CsvImportForm() {
  const [csv, setCsv] = useState("");
  const [mode, setMode] = useState<Mode>("invites");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setCsv(await f.text());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/leader/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, mode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Import failed.");
        return;
      }
      setResult(
        `Done. ${data.invited} invited, ${data.rostered} added to roster, from ${data.total} rows.`
      );
      setCsv("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className={ui.label}>Paste a list (one per line: name, email)</label>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          className={`${ui.input} font-mono text-sm`}
          placeholder={"Jane Smith, jane@example.com\nJohn Doe, john@example.com"}
        />
        <div className="mt-2">
          <input type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="block text-sm text-muted" />
        </div>
      </div>

      <fieldset>
        <legend className={ui.label}>What should this do?</legend>
        <div className="mt-2 space-y-2">
          {MODES.map((m) => (
            <label
              key={m.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                mode === m.value ? "border-clay bg-chip" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="mode"
                className="mt-1 accent-clay"
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
              />
              <span>
                <span className="block text-[15px] font-semibold text-ink">{m.label}</span>
                <span className="block text-sm text-muted">{m.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-clay-dark">{error}</p>}
      {result && <p className="text-sm text-forest">{result}</p>}

      <button type="submit" disabled={busy || !csv.trim()} className={ui.btnPrimary}>
        {busy ? "Importing…" : "Import"}
      </button>
    </form>
  );
}
