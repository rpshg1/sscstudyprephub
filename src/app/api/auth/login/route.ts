import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { createUserSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`login:${ip}`, 15, 10 * 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Too many login attempts. Please wait a few minutes.", 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        targetExam: true,
        membershipTier: true,
        bookCredits: true,
        isActive: true,
      },
    });

    if (!user || !verifyPassword(parsed.password, user.passwordHash)) {
      return jsonError("Invalid email or password.", 401);
    }

    if (!user.isActive) {
      return jsonError("This account has been suspended. Contact support.", 403);
    }

    await createUserSession(user.id, {
      userAgent: req.headers.get("user-agent"),
      ip,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        targetExam: user.targetExam,
        membershipTier: user.membershipTier,
        bookCredits: user.bookCredits,
      },
    });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Login error:", err);
    return jsonError("Unable to sign in right now.", 500);
  }
}
