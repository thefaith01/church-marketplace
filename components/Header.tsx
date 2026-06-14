import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "Browse Services" },
  { href: "/messages", label: "Messages" },
  { href: "/my-listings", label: "My Listings" },
  { href: "/manage", label: "Manage" },
  { href: "/about", label: "About Us" },
];

export function Header() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4 bg-white">
      <Link href="/" className="text-xl font-bold text-blue-700">
        ✦ Church Member Marketplace
      </Link>
      <nav className="hidden items-center gap-5 md:flex">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="text-sm text-gray-700 hover:text-blue-700"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
