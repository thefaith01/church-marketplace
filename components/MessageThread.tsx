"use client";
import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
};

export function MessageThread({
  conversationId,
  currentUserId,
  initial,
}: {
  conversationId: string;
  currentUserId: string;
  initial: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refetch() {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setMessages((prev) => {
        const lastNew = data[data.length - 1]?.id;
        const lastOld = prev[prev.length - 1]?.id;
        if (data.length === prev.length && lastNew === lastOld) return prev;
        return data;
      });
    } catch {
      // ignore transient errors; next poll will retry
    }
  }

  // Live updates: poll the authenticated API every few seconds.
  useEffect(() => {
    const t = setInterval(refetch, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: trimmed }),
    });
    setSending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not send message");
      return;
    }
    setContent("");
    refetch();
  }

  return (
    <>
      <div className="mt-5 space-y-3">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? "bg-clay text-paper" : "border border-line bg-paper text-ink"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-[#F3D9CE]" : "text-faint"}`}>
                  {new Date(m.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-center text-sm text-faint">No messages yet. Say hello.</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-4 flex items-center gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-clay/40"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-clay-dark disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
        {error && <span className="text-sm text-clay-dark">{error}</span>}
      </form>
    </>
  );
}
