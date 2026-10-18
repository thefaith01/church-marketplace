import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Log in",
  description: "Log in to Church Member Marketplace to browse services, message providers and manage your bookings.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
