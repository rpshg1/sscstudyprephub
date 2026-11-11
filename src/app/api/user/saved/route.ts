import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PUBLIC_RESOURCE_SELECT } from "@/lib/resources";
import { handleZodError, jsonError, requireApiUser } from "@/lib/api-helpers";

const toggleSchema = z.object({
  resourceId: z.string().min(1),
});

export async function GET() {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const saved = await prisma.savedResource.findMany({
    where: { userId: user.id },
    include: {
      resource: { select: PUBLIC_RESOURCE_SELECT },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: saved.map((s) => s.resource),
  });
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid request body.", 400);

    const { resourceId } = toggleSchema.parse(body);

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, isPublished: true },
    });

    if (!resource || !resource.isPublished) {
      return jsonError("Resource not found.", 404);
    }

    const existing = await prisma.savedResource.findUnique({
      where: { userId_resourceId: { userId: user.id, resourceId } },
    });

    if (existing) {
      await prisma.savedResource.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.savedResource.create({
      data: { userId: user.id, resourceId },
    });
    return NextResponse.json({ saved: true });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Saved toggle error:", err);
    return jsonError("Could not update saved resource.", 500);
  }
}
