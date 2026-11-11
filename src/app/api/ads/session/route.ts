import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOpaqueToken } from "@/lib/crypto";
import { getAdProviderStatus } from "@/lib/ads/adapter";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError } from "@/lib/api-helpers";

const createAdSessionSchema = z.object({
  resourceId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`ad-session:${ip}`, 30, 5 * 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Too many ad session requests. Please wait briefly.", 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);
    const { resourceId } = createAdSessionSchema.parse(body);

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        title: true,
        accessType: true,
        isPublished: true,
        adShortlinkUrl: true,
      },
    });

    if (!resource || !resource.isPublished) {
      return jsonError("Resource not found.", 404);
    }

    if (resource.accessType !== "AD_SUPPORTED") {
      return jsonError("This resource does not use rewarded ad unlocks.", 400);
    }

    const providerStatus = getAdProviderStatus(resource.adShortlinkUrl);
    if (!providerStatus.isConfigured) {
      return NextResponse.json({
        configured: false,
        provider: providerStatus,
        sessionToken: null,
      });
    }

    const user = await getCurrentUser();
    const sessionToken = generateOpaqueToken(24);
    const providerEnum =
      providerStatus.mode === "server_callback"
        ? "SERVER_CALLBACK"
        : providerStatus.mode === "shrinkme"
          ? "SHRINKME"
          : "DEMO";

    await prisma.adSession.create({
      data: {
        token: sessionToken,
        userId: user?.id ?? null,
        resourceId: resource.id,
        provider: providerEnum,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({
      configured: true,
      provider: providerStatus,
      sessionToken,
      shrinkMeLaunchUrl:
        providerEnum === "SHRINKME" ? `/api/ads/shrinkme/${sessionToken}` : null,
    });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Ad session error:", err);
    return jsonError("Could not initialize rewarded advertisement session.", 500);
  }
}
