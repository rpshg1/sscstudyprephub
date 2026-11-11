import { NextResponse } from "next/server";
import { registerDriveWatchWebhook } from "@/lib/google-drive";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";

export async function POST() {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  try {
    const channel = await registerDriveWatchWebhook();
    return NextResponse.json({
      registered: true,
      ...channel,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not register Drive watch channel.";
    return jsonError(msg, 400);
  }
}
