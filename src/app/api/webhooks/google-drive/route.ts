import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  getGoogleDriveConfigStatus,
  startDriveSyncJob,
} from "@/lib/google-drive";
import { jsonError } from "@/lib/api-helpers";

/**
 * Google Drive API push notification receiver (`files.watch`).
 * On serverless hosts (Vercel), if GITHUB_WORKFLOW_PAT and GITHUB_REPO are set,
 * dispatches the heavy PDF processing worker on GitHub Actions immediately so
 * large 150-450 MB PDFs never hit serverless execution timeouts.
 */
export async function POST(req: Request) {
  const expectedToken = process.env.GOOGLE_DRIVE_WEBHOOK_SECRET?.trim();
  const providedToken = req.headers.get("x-goog-channel-token") || "";

  if (expectedToken) {
    const a = Buffer.from(expectedToken, "utf8");
    const b = Buffer.from(providedToken, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return jsonError("Invalid Google Drive channel token.", 401);
    }
  }

  const resourceState = req.headers.get("x-goog-resource-state") || "";
  if (resourceState === "sync") {
    return NextResponse.json({ acknowledged: true, state: "sync" });
  }

  const githubPat = process.env.GITHUB_WORKFLOW_PAT?.trim();
  const githubRepo = process.env.GITHUB_REPO?.trim();
  if (githubPat && githubRepo) {
    const dispatchRes = await fetch(
      `https://api.github.com/repos/${githubRepo}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubPat}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "SSPH-Drive-Webhook",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event_type: "google-drive-upload" }),
        cache: "no-store",
      }
    );
    return NextResponse.json({
      received: true,
      dispatchedToGitHub: dispatchRes.ok,
      status: dispatchRes.status,
    });
  }

  const config = getGoogleDriveConfigStatus();
  if (!config.configured) {
    return NextResponse.json({ ignored: true, reason: "Drive unconfigured" });
  }

  const job = startDriveSyncJob(`drive_webhook:${resourceState || "change"}`, {
    autoPublish: process.env.DRIVE_AUTO_PUBLISH === "true",
    maxImportCount: 5,
  });
  return NextResponse.json({ received: true, ...job }, { status: 202 });
}
