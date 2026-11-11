import { verifyHmacSha256 } from "@/lib/crypto";

export interface RazorpayConfigStatus {
  configured: boolean;
  keyId: string | null;
  webhookConfigured: boolean;
  mode: "live" | "test" | "unconfigured";
}

export function getRazorpayConfigStatus(): RazorpayConfigStatus {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";
  const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || keyId;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "";

  const configured = Boolean(keyId && keySecret && publicKeyId);
  let mode: "live" | "test" | "unconfigured" = "unconfigured";
  if (configured) {
    mode = keyId.startsWith("rzp_live_") ? "live" : "test";
  }

  return {
    configured,
    keyId: configured ? publicKeyId : null,
    webhookConfigured: Boolean(webhookSecret),
    mode,
  };
}

export interface CreateRazorpayOrderInput {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<RazorpayOrderResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  return (await res.json()) as RazorpayOrderResponse;
}

export function verifyRazorpayCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) return false;
  const payload = `${params.orderId}|${params.paymentId}`;
  return verifyHmacSha256(payload, params.signature, secret);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  webhookSignatureHeader: string | null
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!webhookSecret || !webhookSignatureHeader) {
    return false;
  }
  return verifyHmacSha256(rawBody, webhookSignatureHeader, webhookSecret);
}
