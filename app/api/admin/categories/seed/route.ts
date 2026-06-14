import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const DEFAULTS = [
  { name: "Home & Trades", icon: "🛠️", sortOrder: 1 },
  { name: "Family & Care", icon: "👪", sortOrder: 2 },
  { name: "Professional", icon: "💼", sortOrder: 3 },
  { name: "Beauty & Wellness", icon: "💇", sortOrder: 4 },
  { name: "Tutoring & Music", icon: "🎵", sortOrder: 5 },
  { name: "Food & Events", icon: "🍽️", sortOrder: 6 },
];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.category.createMany({
    data: DEFAULTS.map((d) => ({
      name: d.name,
      slug: slugify(d.name),
      icon: d.icon,
      sortOrder: d.sortOrder,
    })),
    skipDuplicates: true,
  });

  return NextResponse.redirect(new URL("/admin/categories", req.url));
}
