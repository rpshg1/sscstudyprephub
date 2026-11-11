import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIpAddress } from "@/lib/crypto";
import { getClientIp } from "@/lib/rate-limit";
import { jsonError } from "@/lib/api-helpers";

/**
 * Handles external ad-monetized shortlink redirects (e.g., ShrinkMe.io).
 * Notice: Redirecting through an external shortlink NEVER exposes SSPH's
 * internal protected storage URL (`protectedFileUrl` / `storagePath`) and NEVER
 * grants a verified server-side unlock inside SSPH. ShrinkMe displays its own
 * ads and redirects the user's browser to the external free download mirror.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token || token.length < 12) {
    return jsonError("Invalid shortlink session token.", 400);
  }

  const session = await prisma.adSession.findUnique({
    where: { token },
    include: {
      resource: {
        select: {
          id: true,
          isPublished: true,
          accessType: true,
          adShortlinkUrl: true,
        },
      },
    },
  });

  if (
    !session ||
    session.provider !== "SHRINKME" ||
    !session.resource.isPublished ||
    session.resource.accessType !== "AD_SUPPORTED" ||
    !session.resource.adShortlinkUrl
  ) {
    return jsonError("Ad-supported shortlink is unavailable for this resource.", 404);
  }

  if (session.expiresAt <= new Date()) {
    return jsonError("Session expired. Please click Download Now again.", 410);
  }

  const targetUrl = session.resource.adShortlinkUrl;
  if (!/^https?:\/\//i.test(targetUrl)) {
    return jsonError("Configured shortlink URL is invalid.", 500);
  }

  await prisma.$transaction([
    prisma.adSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        externalRef: "SHRINKME_EXTERNAL_REDIRECT",
        verifiedAt: new Date(),
      },
    }),
    prisma.downloadLog.create({
      data: {
        userId: session.userId,
        resourceId: session.resourceId,
        method: "SHRINKME_REDIRECT",
        ipHash: hashIpAddress(getClientIp(req)),
      },
    }),
    prisma.resource.update({
      where: { id: session.resourceId },
      data: { downloadCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.redirect(targetUrl, {
    status: 302,
    headers: { "Cache-Control": "private, no-store" },
  });
}
