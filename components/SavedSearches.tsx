"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Search = {
  id: string;
  label: string | null;
  keyword: string | null;
  category: string | null;
  serviceArea: string | null;
  pricingType: string | null;
};

type Current = {
  keyword?: string;
  category?: string;
  serviceArea?: string;
  pricingType?: string;
};

function toQuery(s: {
  keyword?: string | null;
  category?: string | null;
  serviceArea?: string | null;
  pricingType?: string | null;
}) {
  const p = new URLSearchParams();
  if (s.keyword) p.set("keyword", s.keyword);
  if (s.category) p.set("category", s.category);
  if (s.serviceArea) p.set("serviceArea", s.serviceArea);
  if (s.pricingType) p.set("pricingType", s.pricingType);
  return p.toString();
}

function describe(s: Search) {
  if (s.label) return s.label;
  const parts = [s.keyword, s.category, s.serviceArea, s.pricingType].filter(Boolean);
  return parts.length ? parts.join(" · ") : "All listings";
}

export default function SavedSearches({
  searches,
  current,
}: {
  searches: Search[];
  current: Current;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const hasFilters = Boolean(
    current.keyword || current.category || current.serviceArea || current.pricingType
  );

  async function save() {
    setBusy(true);
    try {
      await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/saved-searches/${id}/delete`, { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (searches.length === 0 && !hasFilters) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {searches.map((s) => (
        <span
          key={s.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper py-1 pl-3 pr-1.5 text-sm"
        >
          <a href={`/listings?${toQuery(s)}`} className="text-ink no-underline hover:text-clay">
            {describe(s)}
          </a>
          <button
            type="button"
            onClick={() => remove(s.id)}
            disabled={busy}
            aria-label="Remove saved search"
            className="grid h-5 w-5 place-items-center rounded-full text-faint hover:bg-chip hover:text-clay-dark"
          >
            ×
          </button>
        </span>
      ))}

      {hasFilters && (
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full border-[1.5px] border-[#D8C9AE] px-3 py-1.5 text-sm font-semibold text-ink hover:bg-chip"
        >
          ☆ Save this search
        </button>
      )}
    </div>
  );
}
