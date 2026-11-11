import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDriveSyncJobStatus,
  getGoogleDriveConfigStatus,
  startDriveSyncJob,
} from "@/lib/google-drive";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";

export async function GET() {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  const config = getGoogleDriveConfigStatus();
  const logs = await prisma.driveSyncLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return NextResponse.json({
    config,
    shrinkMeConfigured: Boolean(process.env.SHRINKME_API_TOKEN?.trim()),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    activeJob: getDriveSyncJobStatus(),
    logs,
  });
}

export async function POST(req: Request) {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  const config = getGoogleDriveConfigStatus();
  if (!config.configured) {
    return jsonError(
      "Google Drive is not configured yet. Add GOOGLE_DRIVE_FOLDER_ID and GOOGLE_SERVICE_ACCOUNT_JSON (or GOOGLE_DRIVE_API_KEY) to .env.",
      400,
      { config }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    autoPublish?: boolean;
    maxImportCount?: number;
  };

  const result = startDriveSyncJob("admin_manual", {
    autoPublish: Boolean(body?.autoPublish),
    maxImportCount: Number(body?.maxImportCount) || 5,
  });

  return NextResponse.json(result, { status: 202 });
}
