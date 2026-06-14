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
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-800"
      >
        {loading ? "Sending…" : "Send"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}
