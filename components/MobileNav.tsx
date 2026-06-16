"use client";

import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "Browse" },
  { href: "/requests", label: "Requests" },
  { href: "/favorites", label: "Saved" },
  { href: "/messages", label: "Messages" },
  { href: "/my-listings", label: "My Listings" },
  { href: "/manage", label: "Manage" },
  { href: "/notifications", label: "Notifications" },
  { href: "/about", label: "About" },
];

export default function MobileNav({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-chip"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 top-[57px] z-30 bg-black/20" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 top-[57px] z-40 border-b border-[#E7DDC9] bg-cream px-6 py-4 shadow-lg">
            <nav className="flex flex-col">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-[#EFE7D6] py-3 text-[15px] font-medium text-ink no-underline last:border-0"
                >
                  {n.label}
                </a>
              ))}
            </nav>

            <div className="mt-4">
              {email ? (
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-clay px-5 py-2.5 text-[15px] font-semibold text-paper hover:bg-clay-dark"
                  >
                    Log out
                  </button>
                </form>
              ) : (
                <div className="flex gap-3">
                  <a
                    href="/login"
                    className="flex-1 rounded-full border-[1.5px] border-[#D8C9AE] py-2.5 text-center text-[15px] font-semibold text-ink no-underline"
                  >
                    Log in
                  </a>
                  <a
                    href="/signup"
                    className="flex-1 rounded-full bg-clay py-2.5 text-center text-[15px] font-semibold text-paper no-underline"
                  >
                    Get verified
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
