"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

export function RequestRespond({ requesterId }: { requesterId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function respond() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: requesterId }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(d.error || "Could not start a conversation");
      return;
    }
    router.push(`/messages/${d.id}`);
  }

  return (
    <div>
      <button onClick={respond} disabled={loading} className={ui.btnPrimary}>
        {loading ? "Opening…" : "Respond with a message"}
      </button>
      {error && <p className="mt-1 text-sm text-clay-dark">{error}</p>}
    </div>
  );
}
