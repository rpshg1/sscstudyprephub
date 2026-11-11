import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { fulfillRazorpayPurchase } from "@/lib/payments";
import { jsonError } from "@/lib/api-helpers";

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const eventId = req.headers.get("x-razorpay-event-id") || undefined;

    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return jsonError("Invalid Razorpay webhook signature.", 401);
    }

    const data = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const event = data.event;
    const paymentEntity = data.payload?.payment?.entity;

    if (!paymentEntity?.order_id || !paymentEntity?.id) {
      return NextResponse.json({ received: true, ignored: true });
    }

    if (event === "payment.captured" || event === "order.paid") {
      const result = await fulfillRazorpayPurchase({
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
        webhookEventId: eventId ?? `${event}:${paymentEntity.id}`,
      });
      return NextResponse.json({ received: true, ...result });
    }

    if (event === "payment.failed") {
      await prisma.purchase.updateMany({
        where: {
          razorpayOrderId: paymentEntity.order_id,
          status: "CREATED",
        },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ received: true, markedFailed: true });
    }

    return NextResponse.json({ received: true, event });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return jsonError("Webhook processing error.", 500);
  }
}
