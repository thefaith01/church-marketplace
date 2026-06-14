"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete this listing? This also removes its booking requests and cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error || "Could not delete listing");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-full border-[1.5px] border-[#E2C3B6] px-3.5 py-1.5 text-xs font-semibold text-clay-dark transition-colors hover:bg-[#F3E1D9] disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
