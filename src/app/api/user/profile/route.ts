import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validation";
import { handleZodError, jsonError, requireApiUser } from "@/lib/api-helpers";

export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = profileUpdateSchema.parse(body);

    // Strictly whitelist non-privileged fields only; never role, membershipTier, or bookCredits.
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.name,
        targetExam: parsed.targetExam,
        phone: parsed.phone || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        targetExam: true,
        phone: true,
        membershipTier: true,
        bookCredits: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Profile update error:", err);
    return jsonError("Could not update profile.", 500);
  }
}
