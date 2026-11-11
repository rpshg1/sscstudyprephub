import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateOpaqueToken, hashIpAddress, sha256Hex } from "@/lib/crypto";
import type { ExamCategory, MembershipTier, Role } from "@prisma/client";

export const SESSION_COOKIE_NAME = "ssph_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  targetExam: ExamCategory;
  phone: string | null;
  membershipTier: MembershipTier;
  bookCredits: number;
  lifetimeActivatedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  targetExam: true,
  phone: true,
  membershipTier: true,
  bookCredits: true,
  lifetimeActivatedAt: true,
  isActive: true,
  createdAt: true,
} as const;

export async function createUserSession(
  userId: string,
  meta?: { userAgent?: string | null; ip?: string | null }
): Promise<string> {
  const rawToken = generateOpaqueToken(32);
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      userAgent: meta?.userAgent?.slice(0, 250) ?? null,
      ipHash: hashIpAddress(meta?.ip),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return rawToken;
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!rawToken) return null;

    const tokenHash = sha256Hex(rawToken);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: SAFE_USER_SELECT,
        },
      },
    });

    if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
      if (session && session.expiresAt <= new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function requireUser(redirectPath = "/login"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectPath);
  }
  return user;
}

export async function requireAdmin(redirectPath = "/login"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectPath);
  }
  if (user.role !== "ADMIN") {
    redirect("/dashboard?error=unauthorized");
  }
  return user;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    const tokenHash = sha256Hex(rawToken);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
