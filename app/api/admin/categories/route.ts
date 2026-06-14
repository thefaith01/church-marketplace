import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.formData();
  const name = (body.get("name") as string)?.trim();
  const icon = (body.get("icon") as string)?.trim() || null;
  const sortOrder = parseInt((body.get("sortOrder") as string) || "0", 10) || 0;

  if (name) {
    const slug = slugify(name) || name;
    try {
      await prisma.category.create({ data: { name, slug, icon, sortOrder } });
    } catch (err) {
      // Likely a duplicate slug; ignore and return to the list.
      console.error("[category create]", err);
    }
  }

  return NextResponse.redirect(new URL("/admin/categories", req.url));
}
