import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyServerAdCallbackSignature } from "@/lib/ads/adapter";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError } from "@/lib/api-helpers";

const callbackSchema = z.object({
  sessionToken: z.string().min(12),
  externalRef: z.string().min(2).max(160),
  timestamp: z.union([z.string(), z.number()]).transform(String),
  signature: z.string().min(32),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`ad-callback:${ip}`, 120, 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Rate limit exceeded.", 429);
    }

    if (process.env.AD_PROVIDER_MODE?.trim().toLowerCase() !== "server_callback") {
      return jsonError("Server callback ad provider is not enabled.", 403);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON callback payload.", 400);

    const parsed = callbackSchema.parse(body);

    const isValidSig = verifyServerAdCallbackSignature(parsed);
    if (!isValidSig) {
      return jsonError("Invalid or expired ad provider callback signature.", 401);
    }

    const session = await prisma.adSession.findUnique({
      where: { token: parsed.sessionToken },
    });

    if (!session) {
      return jsonError("Ad session not found.", 404);
    }

    if (session.expiresAt <= new Date() && session.status === "PENDING") {
      await prisma.adSession.update({
        where: { id: session.id },
        data: { status: "EXPIRED" },
      });
      return jsonError("Ad session expired.", 410);
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.adSession.updateMany({
        where: {
          id: session.id,
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          externalRef: parsed.externalRef,
          verifiedAt: new Date(),
        },
      });

      if (updated.count === 1 && session.userId) {
        await tx.resourceUnlock.upsert({
          where: {
            userId_resourceId: {
              userId: session.userId,
              resourceId: session.resourceId,
            },
          },
          update: {},
          create: {
            userId: session.userId,
            resourceId: session.resourceId,
            unlockMethod: "AD_REWARDED",
            creditUsed: false,
            adSessionId: session.id,
          },
        });
      }
    });

    return NextResponse.json({ ok: true, verified: true });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Ad callback error:", err);
    return jsonError("Unable to process ad callback.", 500);
  }
}
