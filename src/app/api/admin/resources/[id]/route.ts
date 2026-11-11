import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminResourceSchema } from "@/lib/validation";
import { handleZodError, jsonError, requireApiAdmin } from "@/lib/api-helpers";

const partialResourceSchema = adminResourceSchema.partial();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = partialResourceSchema.parse(body);

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Resource not found.", 404);
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
        ...(parsed.description !== undefined ? { description: parsed.description } : {}),
        ...(parsed.shortDescription !== undefined
          ? { shortDescription: parsed.shortDescription || null }
          : {}),
        ...(parsed.examCategory !== undefined ? { examCategory: parsed.examCategory } : {}),
        ...(parsed.resourceType !== undefined ? { resourceType: parsed.resourceType } : {}),
        ...(parsed.subject !== undefined ? { subject: parsed.subject } : {}),
        ...(parsed.categoryId !== undefined ? { categoryId: parsed.categoryId } : {}),
        ...(parsed.coverImageUrl !== undefined
          ? { coverImageUrl: parsed.coverImageUrl || null }
          : {}),
        ...(parsed.coverAccent !== undefined ? { coverAccent: parsed.coverAccent } : {}),
        ...(parsed.storageType !== undefined ? { storageType: parsed.storageType } : {}),
        ...(parsed.protectedFileUrl !== undefined
          ? { protectedFileUrl: parsed.protectedFileUrl || null }
          : {}),
        ...(parsed.storagePath !== undefined
          ? { storagePath: parsed.storagePath || null }
          : {}),
        ...(parsed.driveFileId !== undefined
          ? { driveFileId: parsed.driveFileId || null }
          : {}),
        ...(parsed.sampleStoragePath !== undefined
          ? { sampleStoragePath: parsed.sampleStoragePath || null }
          : {}),
        ...(parsed.samplePageCount !== undefined
          ? { samplePageCount: parsed.samplePageCount ?? null }
          : {}),
        ...(parsed.adShortlinkUrl !== undefined
          ? { adShortlinkUrl: parsed.adShortlinkUrl || null }
          : {}),
        ...(parsed.fileFormat !== undefined ? { fileFormat: parsed.fileFormat } : {}),
        ...(parsed.fileSizeLabel !== undefined ? { fileSizeLabel: parsed.fileSizeLabel } : {}),
        ...(parsed.pageCount !== undefined ? { pageCount: parsed.pageCount ?? null } : {}),
        ...(parsed.authorSource !== undefined ? { authorSource: parsed.authorSource } : {}),
        ...(parsed.author !== undefined ? { author: parsed.author || null } : {}),
        ...(parsed.publisher !== undefined ? { publisher: parsed.publisher || null } : {}),
        ...(parsed.yearPublished !== undefined
          ? { yearPublished: parsed.yearPublished ?? null }
          : {}),
        ...(parsed.language !== undefined ? { language: parsed.language } : {}),
        ...(parsed.edition !== undefined ? { edition: parsed.edition || null } : {}),
        ...(parsed.isbn !== undefined ? { isbn: parsed.isbn || null } : {}),
        ...(parsed.difficulty !== undefined ? { difficulty: parsed.difficulty } : {}),
        ...(parsed.genreJson !== undefined ? { genreJson: parsed.genreJson || null } : {}),
        ...(parsed.subjectsJson !== undefined
          ? { subjectsJson: parsed.subjectsJson || null }
          : {}),
        ...(parsed.examRelevanceJson !== undefined
          ? { examRelevanceJson: parsed.examRelevanceJson || null }
          : {}),
        ...(parsed.tagsJson !== undefined ? { tagsJson: parsed.tagsJson || null } : {}),
        ...(parsed.seoMetadataJson !== undefined
          ? { seoMetadataJson: parsed.seoMetadataJson || null }
          : {}),
        ...(parsed.accessType !== undefined ? { accessType: parsed.accessType } : {}),
        ...(parsed.isPublished !== undefined ? { isPublished: parsed.isPublished } : {}),
        ...(parsed.isFeatured !== undefined ? { isFeatured: parsed.isFeatured } : {}),
        ...(parsed.isDemo !== undefined ? { isDemo: parsed.isDemo } : {}),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ resource: updated });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Admin update resource error:", err);
    return jsonError("Could not update resource.", 500);
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const existing = await prisma.resource.findUnique({ where: { id } });
  if (!existing) {
    return jsonError("Resource not found.", 404);
  }

  await prisma.resource.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
