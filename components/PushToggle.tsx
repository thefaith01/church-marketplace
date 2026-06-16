"use client";

import { useEffect, useState } from "react";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "loading" | "unsupported" | "unconfigured" | "off" | "on" | "denied" | "working";

export default function PushToggle() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (!VAPID) {
      setState("unconfigured");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setState(sub ? "on" : "off");
    });
  }, []);

  async function enable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "off");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID!),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setState(res.ok ? "on" : "off");
    } catch (err) {
      console.error("[push] enable failed:", err);
      setState("off");
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch (err) {
      console.error("[push] disable failed:", err);
    }
  }

  if (state === "loading") return <span className="text-sm text-faint">Checking…</span>;
  if (state === "unsupported")
    return <span className="text-sm text-faint">This browser doesn&rsquo;t support push notifications.</span>;
  if (state === "unconfigured")
    return <span className="text-sm text-faint">Push is not configured yet.</span>;
  if (state === "denied")
    return (
      <span className="text-sm text-faint">
        Notifications are blocked in your browser settings. Re-enable them there to turn this on.
      </span>
    );

  if (state === "on")
    return (
      <button
        type="button"
        onClick={disable}
        className="rounded-full border-[1.5px] border-[#D8C9AE] px-4 py-2 text-sm font-semibold text-ink hover:bg-chip"
      >
        Disable push on this device
      </button>
    );

  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === "working"}
      className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-paper hover:bg-clay-dark disabled:opacity-60"
    >
      {state === "working" ? "Working…" : "Enable push on this device"}
    </button>
  );
}
