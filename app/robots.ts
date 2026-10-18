import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const DISALLOW = [
  "/api/",
  "/admin",
  "/leader",
  "/dashboard",
  "/manage",
  "/messages",
  "/listings",
  "/providers",
  "/requests",
  "/bookings",
  "/favorites",
  "/notifications",
  "/my-listings",
  "/churches",
  "/join",
  "/reset-password",
];

const AGENTS = [
  "*",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
