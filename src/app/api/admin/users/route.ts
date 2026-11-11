import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminUserUpdateSchema } from "@/lib/validation";
import { handleZodError, jsonError, requireApiAdmin } from "@/lib/api-helpers";

export async function GET() {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      targetExam: true,
      membershipTier: true,
      bookCredits: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { downloads: true, purchases: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

const patchBodySchema = adminUserUpdateSchema.extend({
  userId: z.string().min(1),
});

export async function PATCH(req: Request) {
  try {
    const { user: admin, errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = patchBodySchema.parse(body);

    if (parsed.userId === admin.id && parsed.role === "STUDENT") {
      return jsonError("You cannot demote your own active administrator account.", 400);
    }
    if (parsed.userId === admin.id && parsed.isActive === false) {
      return jsonError("You cannot deactivate your own account.", 400);
    }

    const updated = await prisma.user.update({
      where: { id: parsed.userId },
      data: {
        ...(parsed.role !== undefined ? { role: parsed.role } : {}),
        ...(parsed.isActive !== undefined ? { isActive: parsed.isActive } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        membershipTier: true,
        bookCredits: true,
        isActive: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    return jsonError("Could not update user.", 400);
  }
}
