import { NextResponse } from "next/server";
import { getRazorpayConfigStatus } from "@/lib/razorpay";

export async function GET() {
  const status = getRazorpayConfigStatus();
  return NextResponse.json({
    configured: status.configured,
    keyId: status.keyId,
    mode: status.mode,
    webhookConfigured: status.webhookConfigured,
  });
}
