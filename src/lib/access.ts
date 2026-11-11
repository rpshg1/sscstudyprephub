import { prisma } from "@/lib/prisma";
import { generateOpaqueToken, hashIpAddress, sha256Hex } from "@/lib/crypto";
import type { SafeUser } from "@/lib/auth";
import type { AccessType, UnlockMethod } from "@prisma/client";

export class AccessError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 403, code = "ACCESS_DENIED") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface ResourceAccessSummary {
  canDownloadDirectly: boolean;
  canUnlockWithCredit: boolean;
  requiresAdUnlock: boolean;
  requiresPaidMembership: boolean;
  alreadyUnlocked: boolean;
  unlockReason:
    | "FREE_PUBLIC"
    | "LIFETIME_PREMIUM"
    | "ALREADY_UNLOCKED"
    | "CREDIT_AVAILABLE"
    | "AD_REQUIRED"
    | "UPGRADE_REQUIRED";
}

export function evaluateResourceAccess(params: {
  accessType: AccessType;
  user: Pick<SafeUser, "id" | "membershipTier" | "bookCredits"> | null;
  alreadyUnlocked: boolean;
}): ResourceAccessSummary {
  const { accessType, user, alreadyUnlocked } = params;

  if (accessType === "FREE") {
    return {
      canDownloadDirectly: true,
      canUnlockWithCredit: false,
      requiresAdUnlock: false,
      requiresPaidMembership: false,
      alreadyUnlocked,
      unlockReason: "FREE_PUBLIC",
    };
  }

  if (user?.membershipTier === "LIFETIME") {
    return {
      canDownloadDirectly: true,
      canUnlockWithCredit: false,
      requiresAdUnlock: false,
      requiresPaidMembership: false,
      alreadyUnlocked: true,
      unlockReason: "LIFETIME_PREMIUM",
    };
  }

  if (alreadyUnlocked) {
    return {
      canDownloadDirectly: true,
      canUnlockWithCredit: false,
      requiresAdUnlock: false,
      requiresPaidMembership: false,
      alreadyUnlocked: true,
      unlockReason: "ALREADY_UNLOCKED",
    };
  }

  if (user && user.bookCredits > 0) {
    return {
      canDownloadDirectly: false,
      canUnlockWithCredit: true,
      requiresAdUnlock: accessType === "AD_SUPPORTED",
      requiresPaidMembership: false,
      alreadyUnlocked: false,
      unlockReason: "CREDIT_AVAILABLE",
    };
  }

  if (accessType === "AD_SUPPORTED") {
    return {
      canDownloadDirectly: false,
      canUnlockWithCredit: false,
      requiresAdUnlock: true,
      requiresPaidMembership: false,
      alreadyUnlocked: false,
      unlockReason: "AD_REQUIRED",
    };
  }

  return {
    canDownloadDirectly: false,
    canUnlockWithCredit: false,
    requiresAdUnlock: false,
    requiresPaidMembership: true,
    alreadyUnlocked: false,
    unlockReason: "UPGRADE_REQUIRED",
  };
}

export async function issueShortLivedDownloadToken(params: {
  userId: string | null;
  resourceId: string;
  unlockMethod: UnlockMethod;
  ip?: string | null;
  ttlSeconds?: number;
  recordDownload?: boolean;
}): Promise<{ downloadUrl: string; expiresAt: Date }> {
  const rawToken = generateOpaqueToken(32);
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + (params.ttlSeconds ?? 120) * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.downloadToken.create({
      data: {
        tokenHash,
        userId: params.userId,
        resourceId: params.resourceId,
        unlockMethod: params.unlockMethod,
        expiresAt,
        maxUses: 3,
      },
    });

    if (params.recordDownload !== false) {
      await tx.downloadLog.create({
        data: {
          userId: params.userId,
          resourceId: params.resourceId,
          method: params.unlockMethod,
          ipHash: hashIpAddress(params.ip),
        },
      });
      await tx.resource.update({
        where: { id: params.resourceId },
        data: { downloadCount: { increment: 1 } },
      });
    }
  });

  return {
    downloadUrl: `/api/download/${rawToken}`,
    expiresAt,
  };
}

export async function unlockResourceForUser(params: {
  userId: string;
  resourceId: string;
  useCredit?: boolean;
  ip?: string | null;
}): Promise<{
  downloadUrl: string;
  expiresAt: Date;
  unlockMethod: UnlockMethod;
  creditDeducted: boolean;
  remainingCredits: number;
}> {
  const { userId, resourceId, useCredit = false, ip } = params;

  return prisma.$transaction(async (tx) => {
    const resource = await tx.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || !resource.isPublished) {
      throw new AccessError("Resource not found or unavailable.", 404, "NOT_FOUND");
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        membershipTier: true,
        bookCredits: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AccessError("User account is inactive.", 403, "ACCOUNT_INACTIVE");
    }

    // 1. Free resources require no credit
    if (resource.accessType === "FREE") {
      const rawToken = generateOpaqueToken(32);
      const tokenHash = sha256Hex(rawToken);
      const expiresAt = new Date(Date.now() + 120 * 1000);

      await tx.downloadToken.create({
        data: {
          tokenHash,
          userId,
          resourceId,
          unlockMethod: "FREE_DIRECT",
          expiresAt,
          maxUses: 3,
        },
      });
      await tx.downloadLog.create({
        data: {
          userId,
          resourceId,
          method: "FREE_DIRECT",
          ipHash: hashIpAddress(ip),
        },
      });
      await tx.resource.update({
        where: { id: resourceId },
        data: { downloadCount: { increment: 1 } },
      });

      return {
        downloadUrl: `/api/download/${rawToken}`,
        expiresAt,
        unlockMethod: "FREE_DIRECT" as UnlockMethod,
        creditDeducted: false,
        remainingCredits: user.bookCredits,
      };
    }

    // 2. Lifetime premium members get direct access without deducting credits
    if (user.membershipTier === "LIFETIME") {
      const rawToken = generateOpaqueToken(32);
      const tokenHash = sha256Hex(rawToken);
      const expiresAt = new Date(Date.now() + 120 * 1000);

      await tx.resourceUnlock.upsert({
        where: { userId_resourceId: { userId, resourceId } },
        update: {},
        create: {
          userId,
          resourceId,
          unlockMethod: "LIFETIME_PREMIUM",
          creditUsed: false,
        },
      });
      await tx.downloadToken.create({
        data: {
          tokenHash,
          userId,
          resourceId,
          unlockMethod: "LIFETIME_PREMIUM",
          expiresAt,
          maxUses: 3,
        },
      });
      await tx.downloadLog.create({
        data: {
          userId,
          resourceId,
          method: "LIFETIME_PREMIUM",
          ipHash: hashIpAddress(ip),
        },
      });
      await tx.resource.update({
        where: { id: resourceId },
        data: { downloadCount: { increment: 1 } },
      });

      return {
        downloadUrl: `/api/download/${rawToken}`,
        expiresAt,
        unlockMethod: "LIFETIME_PREMIUM" as UnlockMethod,
        creditDeducted: false,
        remainingCredits: user.bookCredits,
      };
    }

    // 3. Previously unlocked unique resource NEVER consumes a second credit
    const existingUnlock = await tx.resourceUnlock.findUnique({
      where: { userId_resourceId: { userId, resourceId } },
    });

    if (existingUnlock) {
      const rawToken = generateOpaqueToken(32);
      const tokenHash = sha256Hex(rawToken);
      const expiresAt = new Date(Date.now() + 120 * 1000);

      await tx.downloadToken.create({
        data: {
          tokenHash,
          userId,
          resourceId,
          unlockMethod: existingUnlock.unlockMethod,
          expiresAt,
          maxUses: 3,
        },
      });
      await tx.downloadLog.create({
        data: {
          userId,
          resourceId,
          method: existingUnlock.unlockMethod,
          ipHash: hashIpAddress(ip),
        },
      });
      await tx.resource.update({
        where: { id: resourceId },
        data: { downloadCount: { increment: 1 } },
      });

      return {
        downloadUrl: `/api/download/${rawToken}`,
        expiresAt,
        unlockMethod: existingUnlock.unlockMethod,
        creditDeducted: false,
        remainingCredits: user.bookCredits,
      };
    }

    // 4. Atomic 10-Books Pass credit deduction
    if (!useCredit) {
      throw new AccessError(
        resource.accessType === "AD_SUPPORTED"
          ? "Complete a verified advertisement or use a book credit to unlock this PDF."
          : "This premium resource requires a 10 Books Pass credit or Lifetime Premium membership.",
        403,
        resource.accessType === "AD_SUPPORTED" ? "AD_REQUIRED" : "UPGRADE_REQUIRED"
      );
    }

    const decremented = await tx.user.updateMany({
      where: {
        id: userId,
        isActive: true,
        bookCredits: { gte: 1 },
      },
      data: {
        bookCredits: { decrement: 1 },
      },
    });

    if (decremented.count === 0) {
      throw new AccessError(
        "Insufficient book credits. Upgrade to the ₹59 10-Books Pass or ₹300 Lifetime Premium.",
        402,
        "INSUFFICIENT_CREDITS"
      );
    }

    // Unique constraint [userId, resourceId] aborts & rolls back decrement on concurrent duplicate unlock
    await tx.resourceUnlock.create({
      data: {
        userId,
        resourceId,
        unlockMethod: "CREDIT_PASS",
        creditUsed: true,
      },
    });

    const refreshedUser = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { bookCredits: true },
    });

    const rawToken = generateOpaqueToken(32);
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 120 * 1000);

    await tx.downloadToken.create({
      data: {
        tokenHash,
        userId,
        resourceId,
        unlockMethod: "CREDIT_PASS",
        expiresAt,
        maxUses: 3,
      },
    });
    await tx.downloadLog.create({
      data: {
        userId,
        resourceId,
        method: "CREDIT_PASS",
        ipHash: hashIpAddress(ip),
      },
    });
    await tx.resource.update({
      where: { id: resourceId },
      data: { downloadCount: { increment: 1 } },
    });

    return {
      downloadUrl: `/api/download/${rawToken}`,
      expiresAt,
      unlockMethod: "CREDIT_PASS" as UnlockMethod,
      creditDeducted: true,
      remainingCredits: refreshedUser.bookCredits,
    };
  });
}
