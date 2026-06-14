"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: trimmed }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not send message");
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={send} className="mt-4 flex items-center gap-2">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message…"
        className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-clay/40"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-clay-dark disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send"}
      </button>
      {error && <span className="text-sm text-clay-dark">{error}</span>}
    </form>
  );
}
