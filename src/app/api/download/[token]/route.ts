import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/crypto";
import { getProtectedResourceDownloadPayload } from "@/lib/storage";
import { jsonError } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    if (!token || token.length < 16) {
      return jsonError("Invalid download token.", 400);
    }

    const tokenHash = sha256Hex(token);
    const record = await prisma.downloadToken.findUnique({
      where: { tokenHash },
      include: {
        resource: true,
      },
    });

    if (!record || !record.resource.isPublished) {
      return jsonError("Download link is invalid or unavailable.", 404);
    }

    if (record.expiresAt <= new Date()) {
      return jsonError("This short-lived download link has expired. Please request a fresh download.", 410);
    }

    if (record.usedCount >= record.maxUses) {
      return jsonError("This download link has already reached its maximum uses.", 410);
    }

    const incremented = await prisma.downloadToken.updateMany({
      where: {
        id: record.id,
        usedCount: { lt: record.maxUses },
        expiresAt: { gt: new Date() },
      },
      data: {
        usedCount: { increment: 1 },
      },
    });

    if (incremented.count === 0) {
      return jsonError("Download link expired or exhausted.", 410);
    }

    const payload = await getProtectedResourceDownloadPayload({
      storageType: record.resource.storageType,
      storagePath: record.resource.storagePath,
      protectedFileUrl: record.resource.protectedFileUrl,
      driveFileId: record.resource.driveFileId,
    });

    const safeFileName = `${record.resource.slug.replace(/[^a-z0-9-]/gi, "-")}.pdf`;

    if (payload.kind === "stream") {
      const headers: Record<string, string> = {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      };
      if (payload.contentLength) {
        headers["Content-Length"] = payload.contentLength;
      }
      return new NextResponse(payload.stream, { status: 200, headers });
    }

    if (payload.kind === "buffer") {
      return new NextResponse(new Uint8Array(payload.buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeFileName}"`,
          "Content-Length": String(payload.buffer.byteLength),
          "Cache-Control": "private, no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // For EXTERNAL_URL or short-lived Supabase Signed URL
    return NextResponse.redirect(payload.url, {
      status: 302,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Protected download error:", err);
    return jsonError("Failed to retrieve protected PDF.", 500);
  }
}
