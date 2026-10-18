import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sign up and get verified",
  description:
    "Join free as a member or a provider, link your church, and once your membership is confirmed you can browse, message and book.",
  path: "/signup",
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
