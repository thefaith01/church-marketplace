"use client";
import { usePathname } from "next/navigation";

// Global footer on every page except the marketing homepage (which has its own).
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-faint">
        <span>© 2026 Church Member Marketplace</span>
        <div className="flex flex-wrap gap-4">
          <a href="/about" className="no-underline hover:text-clay">About</a>
          <a href="/help" className="no-underline hover:text-clay">Help</a>
          <a href="/terms" className="no-underline hover:text-clay">Terms</a>
          <a href="/privacy" className="no-underline hover:text-clay">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
