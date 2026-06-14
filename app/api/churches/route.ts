import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: returns active churches for the signup / profile church picker.
export async function GET() {
  const churches = await prisma.church.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(churches);
}
