"use client";

import { useState } from "react";

// A ready to send invitation a church leader can copy and paste into WhatsApp, email or a church notice.
export default function CopyMessage({ path, churchName }: { path: string; churchName: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin + path : path;
  const text =
    `Hello church family. We now have a private marketplace for our church members, Church Member Marketplace. ` +
    `You can find trusted help from people in our congregations, or offer your own skills and services. ` +
    `It is free, and only church members confirmed by their church leader can see it. ` +
    `Join ${churchName} here, it takes about two minutes: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <p className="whitespace-pre-wrap rounded-lg bg-chip px-3 py-2 text-sm text-ink">{text}</p>
      <button
        type="button"
        onClick={copy}
        className="mt-2 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-paper hover:bg-clay-dark"
      >
        {copied ? "Copied" : "Copy message"}
      </button>
    </div>
  );
}
