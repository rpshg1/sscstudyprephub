import { prisma } from "@/lib/prisma";
import { PRICING_PLANS } from "@/lib/constants";

export async function fulfillRazorpayPurchase(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string | null;
  webhookEventId?: string | null;
}): Promise<{
  fulfilled: boolean;
  alreadyProcessed: boolean;
  planType: "TEN_BOOKS" | "LIFETIME";
  userId: string;
}> {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, webhookEventId } = params;

  return prisma.$transaction(async (tx) => {
    if (webhookEventId) {
      const seenEvent = await tx.purchase.findUnique({
        where: { webhookEventId },
      });
      if (seenEvent) {
        return {
          fulfilled: false,
          alreadyProcessed: true,
          planType: seenEvent.planType,
          userId: seenEvent.userId,
        };
      }
    }

    const purchase = await tx.purchase.findUnique({
      where: { razorpayOrderId },
    });

    if (!purchase) {
      throw new Error(`Order ${razorpayOrderId} not found in database.`);
    }

    if (purchase.status === "PAID") {
      if (webhookEventId && !purchase.webhookEventId) {
        await tx.purchase.update({
          where: { id: purchase.id },
          data: { webhookEventId },
        });
      }
      return {
        fulfilled: false,
        alreadyProcessed: true,
        planType: purchase.planType,
        userId: purchase.userId,
      };
    }

    const updated = await tx.purchase.updateMany({
      where: {
        id: purchase.id,
        status: { not: "PAID" },
      },
      data: {
        status: "PAID",
        razorpayPaymentId,
        razorpaySignature: razorpaySignature ?? purchase.razorpaySignature,
        webhookEventId: webhookEventId ?? purchase.webhookEventId,
        paidAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return {
        fulfilled: false,
        alreadyProcessed: true,
        planType: purchase.planType,
        userId: purchase.userId,
      };
    }

    const user = await tx.user.findUniqueOrThrow({
      where: { id: purchase.userId },
      select: { id: true, membershipTier: true },
    });

    if (purchase.planType === "TEN_BOOKS") {
      await tx.user.update({
        where: { id: user.id },
        data: {
          bookCredits: { increment: PRICING_PLANS.TEN_BOOKS.credits },
          membershipTier: user.membershipTier === "LIFETIME" ? "LIFETIME" : "TEN_BOOKS",
        },
      });
    } else if (purchase.planType === "LIFETIME") {
      await tx.user.update({
        where: { id: user.id },
        data: {
          membershipTier: "LIFETIME",
          lifetimeActivatedAt: new Date(),
        },
      });
    }

    return {
      fulfilled: true,
      alreadyProcessed: false,
      planType: purchase.planType,
      userId: purchase.userId,
    };
  });
}
