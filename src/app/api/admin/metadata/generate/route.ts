import { NextResponse } from "next/server";
import { z } from "zod";
import { enrichBookMetadata } from "@/lib/metadata-enricher";
import { handleZodError, jsonError, requireApiAdmin } from "@/lib/api-helpers";

const generateReqSchema = z.object({
  title: z.string().trim().min(2),
  author: z.string().trim().optional().default(""),
  edition: z.string().trim().optional().default(""),
  language: z.string().trim().optional().default("English"),
  year: z.union([z.string(), z.number()]).optional().default(""),
  actualPdfPages: z.coerce.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  try {
    const { errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = generateReqSchema.parse(body);

    const result = await enrichBookMetadata({
      title: parsed.title,
      author: parsed.author,
      edition: parsed.edition,
      language: parsed.language,
      year: parsed.year,
      actualPdfPages: parsed.actualPdfPages,
    });

    return NextResponse.json(result);
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Metadata generate error:", err);
    return jsonError("Could not generate book metadata.", 500);
  }
}
