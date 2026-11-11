import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOpaqueToken, sha256Hex } from "@/lib/crypto";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`forgot:${ip}`, 6, 15 * 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Too many reset requests. Please try again later.", 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid request body.", 400);

    const parsed = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true, email: true, name: true, isActive: true },
    });

    if (user && user.isActive) {
      const rawToken = generateOpaqueToken(32);
      const tokenHash = sha256Hex(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    }

    // Generic response prevents account email enumeration
    return NextResponse.json({
      message:
        "If an account exists for that email address, password reset instructions have been processed.",
    });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Forgot password error:", err);
    return jsonError("Unable to process password reset.", 500);
  }
}
