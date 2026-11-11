import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  AccessError,
  issueShortLivedDownloadToken,
  unlockResourceForUser,
} from "@/lib/access";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { jsonError } from "@/lib/api-helpers";

const accessRequestSchema = z.object({
  useCredit: z.boolean().optional().default(false),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`access:${ip}`, 40, 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Too many download requests. Please wait a moment.", 429);
    }

    const { id: resourceId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const parsed = accessRequestSchema.safeParse(body);
    const useCredit = parsed.success ? parsed.data.useCredit : false;

    const user = await getCurrentUser();

    // Guest users can directly download FREE public resources only
    if (!user) {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        select: { id: true, isPublished: true, accessType: true },
      });

      if (!resource || !resource.isPublished) {
        return jsonError("Resource not found.", 404);
      }

      if (resource.accessType !== "FREE") {
        return jsonError(
          resource.accessType === "AD_SUPPORTED"
            ? "Watch an advertisement to unlock this PDF, or sign in with a membership."
            : "Please sign in with a 10 Books Pass or Lifetime Premium membership.",
          401,
          {
            code:
              resource.accessType === "AD_SUPPORTED"
                ? "AD_REQUIRED"
                : "AUTH_REQUIRED",
          }
        );
      }

      const tokenResult = await issueShortLivedDownloadToken({
        userId: null,
        resourceId: resource.id,
        unlockMethod: "FREE_DIRECT",
        ip,
      });

      return NextResponse.json({
        downloadUrl: tokenResult.downloadUrl,
        expiresAt: tokenResult.expiresAt,
        unlockMethod: "FREE_DIRECT",
        creditDeducted: false,
      });
    }

    const result = await unlockResourceForUser({
      userId: user.id,
      resourceId,
      useCredit,
      ip,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AccessError) {
      return jsonError(err.message, err.statusCode, { code: err.code });
    }
    console.error("Resource access error:", err);
    return jsonError("Unable to authorize download.", 500);
  }
}
