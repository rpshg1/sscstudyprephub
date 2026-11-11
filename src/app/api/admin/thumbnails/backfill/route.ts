import { NextResponse } from "next/server";
import { backfillPdfThumbnails } from "@/lib/thumbnails";
import { requireApiAdmin } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  const body = (await req.json().catch(() => ({}))) as { overwrite?: boolean };
  const result = await backfillPdfThumbnails(Boolean(body?.overwrite));
  return NextResponse.json(result);
}
