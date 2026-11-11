import { NextResponse } from "next/server";
import { saveAdminPdfUpload } from "@/lib/storage";
import { inspectAndCreateSamplePdf } from "@/lib/pdf-sample";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const { errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    const formData = await req.formData();
    const file = formData.get("file");
    const slugHint = String(formData.get("slugHint") || "ssph-resource");

    if (!(file instanceof File)) {
      return jsonError("No PDF file provided.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveAdminPdfUpload(file, slugHint);

    let sampleInfo = null;
    try {
      sampleInfo = await inspectAndCreateSamplePdf(buffer, slugHint);
    } catch (err) {
      console.warn("Could not slice 10-15 page sample from uploaded PDF:", err);
    }

    return NextResponse.json(
      {
        ...saved,
        totalPages: sampleInfo?.totalPages ?? null,
        samplePageCount: sampleInfo?.samplePageCount ?? null,
        sampleStoragePath: sampleInfo?.sampleStoragePath ?? null,
        thumbnailUrl: sampleInfo?.thumbnailUrl ?? null,
        embeddedTitle: sampleInfo?.embeddedTitle ?? "",
        embeddedAuthor: sampleInfo?.embeddedAuthor ?? "",
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "PDF upload failed.";
    return jsonError(msg, 400);
  }
}
