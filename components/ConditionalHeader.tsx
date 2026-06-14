"use client";
import { usePathname } from "next/navigation";

/**
 * Renders its children on every route except the marketing homepage ("/"),
 * which ships its own branded navigation. Keeps the global app Header on all
 * other pages while avoiding two navbars on the landing page.
 */
export function ConditionalHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
