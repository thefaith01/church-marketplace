import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Arch } from "@/components/ui";
import NotificationBell from "@/components/NotificationBell";
import MobileNav from "@/components/MobileNav";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "Browse" },
  { href: "/requests", label: "Requests" },
  { href: "/favorites", label: "Saved" },
  { href: "/messages", label: "Messages" },
  { href: "/my-listings", label: "My Listings" },
  { href: "/manage", label: "Manage" },
  { href: "/about", label: "About" },
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[#E7DDC9] bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Arch />
          <span className="font-display text-[21px] font-extrabold tracking-[-0.02em] text-ink">
            cmm
          </span>
        </Link>

        <nav className="hidden items-center gap-[26px] md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[15px] font-medium text-[#5A4F40] no-underline transition-colors hover:text-clay"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <NotificationBell />
              <span className="hidden text-sm text-muted lg:inline">{user.email}</span>
              <form action="/api/auth/logout" method="POST" className="hidden md:block">
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-full bg-clay px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-clay-dark"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden whitespace-nowrap text-[15px] font-semibold text-ink no-underline md:inline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden whitespace-nowrap rounded-full bg-clay px-5 py-2.5 text-[15px] font-semibold text-paper no-underline transition-colors hover:bg-clay-dark md:inline-block"
              >
                Get verified
              </Link>
            </>
          )}
          <MobileNav email={user?.email ?? null} />
        </div>
      </div>
    </header>
  );
}
