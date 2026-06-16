"use client";

import { useEffect } from "react";

/** Marks all notifications read when the notifications page mounts. */
export default function MarkAllRead() {
  useEffect(() => {
    fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).catch(() => {});
  }, []);
  return null;
}
