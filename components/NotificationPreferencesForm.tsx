"use client";

import { useState } from "react";

type Prefs = Record<string, boolean>;

const ROWS = [
  { key: "messages", label: "New messages", desc: "When someone sends you a message." },
  { key: "bookings", label: "Bookings", desc: "Requests, accepts, declines, and completions." },
  { key: "verification", label: "Verification", desc: "When your verification status changes." },
  { key: "requests", label: "Requests & matches", desc: "Provider requests and matching service requests." },
] as const;

export default function NotificationPreferencesForm({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [saved, setSaved] = useState(false);

  async function persist(next: Prefs) {
    setPrefs(next);
    setSaved(false);
    try {
      await fetch("/api/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      setSaved(true);
    } catch {
      /* ignore */
    }
  }

  function toggle(field: string) {
    persist({ ...prefs, [field]: !prefs[field] });
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-5 gap-y-1 text-xs font-semibold uppercase tracking-wide text-faint">
        <span />
        <span className="text-center">Email</span>
        <span className="text-center">Push</span>
      </div>

      {ROWS.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[1fr_auto_auto] items-center gap-x-5 border-t border-[#EFE7D6] py-3.5"
        >
          <div>
            <p className="text-[15px] font-semibold text-ink">{row.label}</p>
            <p className="text-sm text-muted">{row.desc}</p>
          </div>
          <input
            type="checkbox"
            aria-label={`${row.label} email`}
            checked={prefs[`${row.key}Email`] !== false}
            onChange={() => toggle(`${row.key}Email`)}
            className="h-5 w-5 accent-clay justify-self-center"
          />
          <input
            type="checkbox"
            aria-label={`${row.label} push`}
            checked={prefs[`${row.key}Push`] !== false}
            onChange={() => toggle(`${row.key}Push`)}
            className="h-5 w-5 accent-clay justify-self-center"
          />
        </div>
      ))}

      <p className="mt-4 h-4 text-sm text-forest">{saved ? "Saved" : ""}</p>
    </div>
  );
}
