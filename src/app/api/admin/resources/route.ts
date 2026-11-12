import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminResourceSchema } from "@/lib/validation";
import { handleZodError, jsonError, requireApiAdmin } from "@/lib/api-helpers";

function toSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || `resource-${Date.now()}`
  );
}

export async function GET() {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  const resources = await prisma.resource.findMany({
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ resources });
}

export async function POST(req: Request) {
  try {
    const { errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = adminResourceSchema.parse(body);

    const baseSlug = parsed.slug ? parsed.slug : toSlug(parsed.title);
    const existingSlug = await prisma.resource.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });
    const finalSlug = existingSlug
      ? `${baseSlug}-${Date.now().toString(36).slice(-4)}`
      : baseSlug;

    if (
      parsed.storageType === "EXTERNAL_URL" &&
      !parsed.protectedFileUrl &&
      !parsed.adShortlinkUrl
    ) {
      return jsonError(
        "Provide a protected PDF URL, upload a PDF file, or specify a ShrinkMe.io shortlink URL.",
        400
      );
    }

    const isRoadmap = parsed.resourceType === "ROADMAP";
    const resolvedAccessType = isRoadmap ? "FREE" : parsed.accessType;
    const resolvedAdShortlink = isRoadmap ? null : parsed.adShortlinkUrl || null;

    const created = await prisma.resource.create({
      data: {
        slug: finalSlug,
        title: parsed.title,
        description: parsed.description,
        shortDescription: parsed.shortDescription || null,
        examCategory: parsed.examCategory,
        resourceType: parsed.resourceType,
        subject: parsed.subject,
        categoryId: parsed.categoryId,
        coverImageUrl: parsed.coverImageUrl || null,
        coverAccent: parsed.coverAccent,
        storageType: parsed.storageType,
        protectedFileUrl: parsed.protectedFileUrl || null,
        storagePath: parsed.storagePath || null,
        driveFileId: parsed.driveFileId || null,
        sampleStoragePath: parsed.sampleStoragePath || null,
        samplePageCount: parsed.samplePageCount ?? null,
        adShortlinkUrl: resolvedAdShortlink,
        fileFormat: parsed.fileFormat,
        fileSizeLabel: parsed.fileSizeLabel,
        pageCount: parsed.pageCount ?? null,
        authorSource: parsed.authorSource,
        author: parsed.author || null,
        publisher: parsed.publisher || null,
        yearPublished: parsed.yearPublished ?? null,
        language: parsed.language || "English",
        edition: parsed.edition || null,
        isbn: parsed.isbn || null,
        difficulty: parsed.difficulty || "intermediate",
        genreJson: parsed.genreJson || null,
        subjectsJson: parsed.subjectsJson || null,
        examRelevanceJson: parsed.examRelevanceJson || null,
        tagsJson: parsed.tagsJson || null,
        seoMetadataJson: parsed.seoMetadataJson || null,
        accessType: resolvedAccessType,
        isPublished: parsed.isPublished,
        isFeatured: parsed.isFeatured,
        isDemo: parsed.isDemo,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ resource: created }, { status: 201 });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Admin create resource error:", err);
    return jsonError("Could not create resource.", 500);
  }
}
