import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { createUserSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`signup:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Too many signup attempts. Please try again later.", 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });

    if (existing) {
      return jsonError("An account with this email already exists.", 409);
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: hashPassword(parsed.password),
        targetExam: parsed.targetExam,
        role: "STUDENT",
        membershipTier: "FREE",
        bookCredits: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        targetExam: true,
        membershipTier: true,
        bookCredits: true,
      },
    });

    await createUserSession(user.id, {
      userAgent: req.headers.get("user-agent"),
      ip,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Signup error:", err);
    return jsonError("Unable to create account right now.", 500);
  }
}
