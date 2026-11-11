import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueShortLivedDownloadToken } from "@/lib/access";
import { getClientIp } from "@/lib/rate-limit";
import { jsonError } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token || token.length < 16) {
    return jsonError("Invalid ad session token.", 400);
  }

  const session = await prisma.adSession.findUnique({
    where: { token },
    include: {
      resource: { select: { id: true, isPublished: true } },
    },
  });

  if (!session || !session.resource.isPublished) {
    return jsonError("Ad session not found.", 404);
  }

  if (session.expiresAt <= new Date() && session.status === "PENDING") {
    await prisma.adSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ status: "EXPIRED" });
  }

  // Strictly refuse to issue a download URL unless server-side verification succeeded
  if (session.status !== "COMPLETED" || !session.verifiedAt) {
    return NextResponse.json({ status: session.status });
  }

  const issued = await issueShortLivedDownloadToken({
    userId: session.userId,
    resourceId: session.resourceId,
    unlockMethod: "AD_REWARDED",
    ip: getClientIp(req),
  });

  return NextResponse.json({
    status: "COMPLETED",
    downloadUrl: issued.downloadUrl,
    expiresAt: issued.expiresAt,
  });
}
