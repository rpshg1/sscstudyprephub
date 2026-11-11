import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSamplePdfPayload } from "@/lib/pdf-sample";
import { jsonError } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        sampleStoragePath: true,
      },
    });

    if (!resource || !resource.isPublished || !resource.sampleStoragePath) {
      return jsonError("Sample preview is not available for this book.", 404);
    }

    const payload = await readSamplePdfPayload(resource.sampleStoragePath);
    const fileName = `${resource.slug.replace(/[^a-z0-9-]/gi, "-")}-sample.pdf`;

    if (payload.kind === "buffer") {
      return new NextResponse(new Uint8Array(payload.buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Content-Length": String(payload.buffer.byteLength),
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return NextResponse.redirect(payload.url, { status: 302 });
  } catch (err) {
    console.error("Sample preview route error:", err);
    return jsonError("Could not load book sample preview.", 500);
  }
}
