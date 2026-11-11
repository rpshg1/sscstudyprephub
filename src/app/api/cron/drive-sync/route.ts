import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  getGoogleDriveConfigStatus,
  syncGoogleDriveFolder,
} from "@/lib/google-drive";
import { jsonError } from "@/lib/api-helpers";

/**
 * Scheduled automatic Drive folder sync endpoint (for Vercel Cron or free cron services).
 * Authorize with `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return jsonError("CRON_SECRET is not configured on this server.", 503);
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const a = Buffer.from(cronSecret, "utf8");
  const b = Buffer.from(token, "utf8");

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return jsonError("Unauthorized cron invocation.", 401);
  }

  const config = getGoogleDriveConfigStatus();
  if (!config.configured) {
    return NextResponse.json({ skipped: true, reason: "Google Drive not configured" });
  }

  const summary = await syncGoogleDriveFolder("cron_auto_sync");
  return NextResponse.json(summary);
}
