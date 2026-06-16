"use client";

import { useState } from "react";

export default function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin + path : path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-lg bg-chip px-3 py-2 text-xs text-ink">{url}</code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-full border-[1.5px] border-[#D8C9AE] px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
