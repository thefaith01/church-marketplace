"use client";
import { useState } from "react";

export function FavoriteButton({
  listingId,
  saved: initial,
}: {
  listingId: string;
  saved: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const next = !saved;
    setSaved(next);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    setLoading(false);
    if (!res.ok) {
      setSaved(!next);
      return;
    }
    const d = await res.json().catch(() => null);
    if (d && typeof d.saved === "boolean") setSaved(d.saved);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className={`grid h-8 w-8 place-items-center rounded-full border text-base transition-colors ${
        saved ? "border-clay bg-chip text-clay" : "border-line bg-paper text-faint hover:text-clay"
      }`}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
