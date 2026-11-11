import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSchema } from "@/lib/validation";
import { verifyRazorpayCheckoutSignature } from "@/lib/razorpay";
import { fulfillRazorpayPurchase } from "@/lib/payments";
import { handleZodError, jsonError, requireApiUser } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = verifyPaymentSchema.parse(body);

    // Ensure order belongs to the authenticated user
    const purchase = await prisma.purchase.findUnique({
      where: { razorpayOrderId: parsed.razorpay_order_id },
      select: { id: true, userId: true },
    });

    if (!purchase || purchase.userId !== user.id) {
      return jsonError("Order not found for your account.", 404);
    }

    const signatureValid = verifyRazorpayCheckoutSignature({
      orderId: parsed.razorpay_order_id,
      paymentId: parsed.razorpay_payment_id,
      signature: parsed.razorpay_signature,
    });

    if (!signatureValid) {
      await prisma.purchase.updateMany({
        where: { id: purchase.id, status: "CREATED" },
        data: { status: "FAILED" },
      });
      return jsonError("Payment signature verification failed.", 400);
    }

    const result = await fulfillRazorpayPurchase({
      razorpayOrderId: parsed.razorpay_order_id,
      razorpayPaymentId: parsed.razorpay_payment_id,
      razorpaySignature: parsed.razorpay_signature,
    });

    return NextResponse.json({
      verified: true,
      fulfilled: result.fulfilled,
      alreadyProcessed: result.alreadyProcessed,
      planType: result.planType,
    });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Verify payment error:", err);
    return jsonError("Payment verification failed.", 500);
  }
}
