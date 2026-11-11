import { NextResponse } from "next/server";
import { z } from "zod";
import { shortenWithShrinkMeApi } from "@/lib/ads/adapter";
import { handleZodError, jsonError, requireApiAdmin } from "@/lib/api-helpers";

const shrinkSchema = z.object({
  targetUrl: z.string().url("Provide a valid http(s) URL to shorten via ShrinkMe.io"),
});

export async function POST(req: Request) {
  try {
    const { errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    if (!process.env.SHRINKME_API_TOKEN?.trim()) {
      return jsonError(
        "SHRINKME_API_TOKEN is not configured in environment variables. You can still paste your ShrinkMe.io short link manually.",
        400
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const { targetUrl } = shrinkSchema.parse(body);
    const shortenedUrl = await shortenWithShrinkMeApi(targetUrl);

    if (!shortenedUrl) {
      return jsonError("ShrinkMe.io API did not return a shortened URL.", 502);
    }

    return NextResponse.json({ shortenedUrl });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Admin ShrinkMe error:", err);
    return jsonError("Could not generate ShrinkMe.io link.", 500);
  }
}
