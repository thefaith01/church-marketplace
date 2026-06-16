"use client";

import { useEffect, useState } from "react";

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (active) setUnread(data.unread || 0);
      } catch {
        /* ignore */
      }
    };
    load();
    const t = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <a
      href="/notifications"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      className="relative grid h-9 w-9 place-items-center rounded-full text-[#5A4F40] no-underline hover:bg-chip"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-paper">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </a>
  );
}
