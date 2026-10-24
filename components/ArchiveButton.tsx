"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArchiveButton({
  conversationId,
  archived,
  redirectTo,
}: {
  conversationId: string;
  archived: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/conversations/${conversationId}/archive`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !archived }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error || "Could not update this conversation");
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="min-h-[36px] shrink-0 rounded-full border-[1.5px] border-[#D8C9AE] px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-chip disabled:opacity-50"
    >
      {loading ? "Saving…" : archived ? "Unarchive" : "Archive"}
    </button>
  );
}
