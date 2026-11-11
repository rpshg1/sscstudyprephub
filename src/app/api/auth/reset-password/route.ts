import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, sha256Hex } from "@/lib/crypto";
import { resetPasswordSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`reset:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Too many attempts. Please try again later.", 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid request body.", 400);

    const parsed = resetPasswordSchema.parse(body);
    const tokenHash = sha256Hex(parsed.token);

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (
      !resetRecord ||
      resetRecord.usedAt !== null ||
      resetRecord.expiresAt <= new Date()
    ) {
      return jsonError("Reset link is invalid or has expired.", 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: hashPassword(parsed.password) },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    return NextResponse.json({
      message: "Your password has been updated. Please sign in with your new password.",
    });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Reset password error:", err);
    return jsonError("Unable to reset password.", 500);
  }
}
