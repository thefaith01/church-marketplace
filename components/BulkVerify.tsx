"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";

type Member = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  verificationStatus: string;
};

export default function BulkVerify({ members }: { members: Member[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const unverified = members.filter((m) => m.verificationStatus !== "VERIFIED");

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === unverified.length ? new Set() : new Set(unverified.map((m) => m.id))
    );
  }

  async function verifySelected() {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await fetch("/api/leader/bulk-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected] }),
      });
      setSelected(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {unverified.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={verifySelected}
            disabled={busy || selected.size === 0}
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Verifying…" : `Verify selected (${selected.size})`}
          </button>
          <button type="button" onClick={toggleAll} className="text-sm font-semibold text-clay">
            {selected.size === unverified.length ? "Clear all" : "Select all pending"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-[18px] border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-chip/50">
            <tr>
              <th className="px-4 py-3" />
              {["Name", "Email", "Role", "Status", "Action"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-semibold text-[#5A4F40]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-4 py-3">
                  {m.verificationStatus !== "VERIFIED" && (
                    <input
                      type="checkbox"
                      aria-label={`Select ${m.fullName}`}
                      checked={selected.has(m.id)}
                      onChange={() => toggle(m.id)}
                      className="h-4 w-4 accent-forest"
                    />
                  )}
                </td>
                <td className="px-5 py-3 font-medium text-ink">{m.fullName}</td>
                <td className="px-5 py-3 text-muted">{m.email}</td>
                <td className="px-5 py-3"><Badge>{m.role}</Badge></td>
                <td className="px-5 py-3">
                  <Badge tone={m.verificationStatus === "VERIFIED" ? "verified" : m.verificationStatus === "PENDING" ? "pending" : "neutral"}>
                    {m.verificationStatus}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  {m.verificationStatus !== "VERIFIED" ? (
                    <form action={`/api/leader/${m.id}/verify`} method="POST">
                      <button type="submit" className="rounded-full bg-forest px-3 py-1 text-xs font-semibold text-paper hover:opacity-90">
                        Confirm
                      </button>
                    </form>
                  ) : (
                    <form action={`/api/leader/${m.id}/reject`} method="POST">
                      <button type="submit" className="rounded-full border-[1.5px] border-[#E2C3B6] px-3 py-1 text-xs font-semibold text-clay-dark hover:bg-[#F3E1D9]">
                        Revoke
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
