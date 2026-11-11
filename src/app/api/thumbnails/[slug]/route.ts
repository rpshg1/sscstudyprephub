import { NextResponse } from "next/server";
import { readThumbnailPayload } from "@/lib/pdf-sample";
import { jsonError } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return jsonError("Invalid thumbnail slug.", 400);
  }

  const payload = await readThumbnailPayload(slug);
  if (!payload) {
    return jsonError("Thumbnail not found.", 404);
  }

  if (payload.kind === "buffer") {
    return new NextResponse(new Uint8Array(payload.buffer), {
      status: 200,
      headers: {
        "Content-Type": payload.contentType,
        "Content-Length": String(payload.buffer.byteLength),
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        "CDN-Cache-Control":
          "public, max-age=604800, stale-while-revalidate=2592000",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return NextResponse.redirect(payload.url, { status: 302 });
}
