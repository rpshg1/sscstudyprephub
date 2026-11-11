import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminCategorySchema } from "@/lib/validation";
import { handleZodError, jsonError, requireApiAdmin } from "@/lib/api-helpers";

export async function GET() {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { resources: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  try {
    const { errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = adminCategorySchema.parse(body);

    const created = await prisma.category.create({
      data: parsed,
    });
    return NextResponse.json({ category: created }, { status: 201 });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Create category error:", err);
    return jsonError("Could not create category (name or slug may already exist).", 400);
  }
}
