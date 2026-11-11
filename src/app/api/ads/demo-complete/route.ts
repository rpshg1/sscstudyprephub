import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isDemoAdEnabled } from "@/lib/ads/adapter";
import { issueShortLivedDownloadToken } from "@/lib/access";
import { getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError } from "@/lib/api-helpers";

const demoSchema = z.object({
  sessionToken: z.string().min(12),
});

export async function POST(req: Request) {
  // Strictly disabled in production environments
  if (process.env.NODE_ENV === "production" || !isDemoAdEnabled()) {
    return jsonError(
      "DEMO rewarded-ad adapter is disabled outside local development.",
      403
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const { sessionToken } = demoSchema.parse(body);

    const session = await prisma.adSession.findUnique({
      where: { token: sessionToken },
      include: { resource: { select: { id: true, isPublished: true } } },
    });

    if (!session || !session.resource.isPublished || session.provider !== "DEMO") {
      return jsonError("Invalid DEMO ad session.", 404);
    }

    if (session.expiresAt <= new Date()) {
      return jsonError("DEMO ad session expired.", 410);
    }

    await prisma.$transaction(async (tx) => {
      await tx.adSession.update({
        where: { id: session.id },
        data: {
          status: "COMPLETED",
          externalRef: "DEMO_DEV_ONLY",
          verifiedAt: new Date(),
        },
      });

      if (session.userId) {
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

    const issued = await issueShortLivedDownloadToken({
      userId: session.userId,
      resourceId: session.resourceId,
      unlockMethod: "AD_REWARDED",
      ip: getClientIp(req),
    });

    return NextResponse.json({
      demo: true,
      downloadUrl: issued.downloadUrl,
      expiresAt: issued.expiresAt,
    });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Demo ad completion error:", err);
    return jsonError("Failed to complete DEMO ad session.", 500);
  }
}
