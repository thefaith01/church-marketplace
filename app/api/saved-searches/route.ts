import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const clean = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  const keyword = clean(body.keyword);
  const category = clean(body.category);
  const serviceArea = clean(body.serviceArea);
  const pricingType = clean(body.pricingType);

  if (!keyword && !category && !serviceArea && !pricingType) {
    return NextResponse.json(
      { error: "Add a filter before saving a search." },
      { status: 400 }
    );
  }

  await prisma.savedSearch.create({
    data: {
      userId: user.id,
      label: clean(body.label),
      keyword,
      category,
      serviceArea,
      pricingType,
    },
  });

  return NextResponse.json({ ok: true });
}
