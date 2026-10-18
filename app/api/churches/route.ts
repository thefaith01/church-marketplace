import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Signed in people only: returns active churches for the profile church picker.
// Not public, so the church list cannot be read by scrapers or search engines.
// The signup page no longer shows a picker; people join through a leader's link or code.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const churches = await prisma.church.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(churches);
}
