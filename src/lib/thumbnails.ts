import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { readSamplePdfPayload, renderFirstPageThumbnail } from "@/lib/pdf-sample";
import { resolveSafeStoragePath } from "@/lib/storage";

/**
 * Generates Page-1 PNG thumbnails for every resource that has a local/sample PDF
 * and does not yet have an `/api/thumbnails/...` cover image set.
 */
export async function backfillPdfThumbnails(overwriteExisting = false): Promise<{
  processed: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const resources = await prisma.resource.findMany({
    select: {
      id: true,
      slug: true,
      coverImageUrl: true,
      sampleStoragePath: true,
      storageType: true,
      storagePath: true,
    },
  });

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const r of resources) {
    if (
      !overwriteExisting &&
      r.coverImageUrl &&
      r.coverImageUrl.startsWith("/api/thumbnails/")
    ) {
      skipped += 1;
      continue;
    }

    try {
      let pdfBuffer: Buffer | null = null;

      if (r.sampleStoragePath) {
        const samplePayload = await readSamplePdfPayload(r.sampleStoragePath);
        if (samplePayload.kind === "buffer") {
          pdfBuffer = samplePayload.buffer;
        }
      } else if (r.storageType === "LOCAL_DEMO_PDF" && r.storagePath) {
        pdfBuffer = await fs.readFile(resolveSafeStoragePath(r.storagePath));
      }

      if (!pdfBuffer) {
        skipped += 1;
        continue;
      }

      const thumbUrl = await renderFirstPageThumbnail(pdfBuffer, r.slug);
      if (!thumbUrl) {
        errors.push(`${r.slug}: Failed to render Page 1`);
        continue;
      }

      await prisma.resource.update({
        where: { id: r.id },
        data: { coverImageUrl: thumbUrl },
      });
      updated += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Thumbnail generation error";
      errors.push(`${r.slug}: ${msg}`);
    }
  }

  return {
    processed: resources.length,
    updated,
    skipped,
    errors,
  };
}
