import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { changePasswordSchema } from "@/lib/validation";
import { handleZodError, jsonError, requireApiUser } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body.", 400);

    const parsed = changePasswordSchema.parse(body);

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!record || !verifyPassword(parsed.currentPassword, record.passwordHash)) {
      return jsonError("Current password is incorrect.", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(parsed.newPassword) },
    });

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Password change error:", err);
    return jsonError("Could not change password.", 500);
  }
}
