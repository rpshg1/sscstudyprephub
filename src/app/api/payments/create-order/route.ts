import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { PRICING_PLANS } from "@/lib/constants";
import { createOrderSchema } from "@/lib/validation";
import { createRazorpayOrder, getRazorpayConfigStatus } from "@/lib/razorpay";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError, requireApiUser } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`pay-order:${ip}`, 15, 10 * 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Too many order requests. Please wait briefly.", 429);
    }

    const { user, errorResponse } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const status = getRazorpayConfigStatus();
    if (!status.configured || !status.keyId) {
      return NextResponse.json(
        {
          configured: false,
          error:
            "Razorpay payment credentials are not configured on this server yet. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID in .env to accept live/test payments.",
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = createOrderSchema.parse(body);

    if (parsed.planType === "LIFETIME" && user.membershipTier === "LIFETIME") {
      return jsonError("Your account already has Lifetime Premium access.", 400);
    }

    const plan =
      parsed.planType === "TEN_BOOKS" ? PRICING_PLANS.TEN_BOOKS : PRICING_PLANS.LIFETIME;
    const creditsGranted =
      parsed.planType === "TEN_BOOKS" ? PRICING_PLANS.TEN_BOOKS.credits : 0;

    const receipt = `ssph_${parsed.planType.toLowerCase()}_${crypto.randomBytes(5).toString("hex")}`;

    const order = await createRazorpayOrder({
      amountPaise: plan.pricePaise,
      receipt,
      notes: {
        userId: user.id,
        planType: parsed.planType,
      },
    });

    await prisma.purchase.create({
      data: {
        userId: user.id,
        planType: parsed.planType,
        amountPaise: plan.pricePaise,
        currency: "INR",
        status: "CREATED",
        razorpayOrderId: order.id,
        creditsGranted,
      },
    });

    return NextResponse.json({
      configured: true,
      keyId: status.keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planTitle: plan.title,
      customer: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Create Razorpay order error:", err);
    return jsonError("Could not create payment order.", 500);
  }
}
