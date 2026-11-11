import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { evaluateResourceAccess } from "@/lib/access";
import { getAdProviderStatus } from "@/lib/ads/adapter";
import { jsonError } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const [resource, user] = await Promise.all([
    prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        accessType: true,
        adShortlinkUrl: true,
        isPublished: true,
      },
    }),
    getCurrentUser(),
  ]);

  if (!resource || !resource.isPublished) {
    return jsonError("Resource not found.", 404);
  }

  let saved = false;
  let alreadyUnlocked = false;
  if (user) {
    const [savedRow, unlockedRow] = await Promise.all([
      prisma.savedResource.findUnique({
        where: {
          userId_resourceId: { userId: user.id, resourceId: resource.id },
        },
        select: { id: true },
      }),
      prisma.resourceUnlock.findUnique({
        where: {
          userId_resourceId: { userId: user.id, resourceId: resource.id },
        },
        select: { id: true },
      }),
    ]);
    saved = Boolean(savedRow);
    alreadyUnlocked = Boolean(unlockedRow);
  }

  const accessSummary = evaluateResourceAccess({
    accessType: resource.accessType,
    user,
    alreadyUnlocked,
  });

  return NextResponse.json(
    {
      isLoggedIn: Boolean(user),
      bookCredits: user?.bookCredits ?? 0,
      initialSaved: saved,
      accessSummary,
      adProvider: getAdProviderStatus(resource.adShortlinkUrl),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return jsonError("Missing resource id.", 400);
  }

  await prisma.resource
    .updateMany({
      where: { id, isPublished: true },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
