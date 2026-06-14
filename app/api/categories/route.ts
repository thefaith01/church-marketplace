import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: list categories for the listing forms and browse filter.
export async function GET() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, icon: true, slug: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}
