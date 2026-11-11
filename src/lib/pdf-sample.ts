import fs from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";
import { resolveSafeStoragePath } from "@/lib/storage";

export interface PdfInspectionResult {
  totalPages: number;
  samplePageCount: number;
  sampleStorageType: "LOCAL" | "SUPABASE";
  sampleStoragePath: string;
  thumbnailUrl: string | null;
  embeddedTitle: string;
  embeddedAuthor: string;
  embeddedSubject: string;
  extractedTextSnippet: string;
}

export async function renderFirstPageThumbnail(
  pdfBytes: Buffer | Uint8Array,
  slug: string
): Promise<string | null> {
  try {
    const { renderPageAsImage } = await import("unpdf");
    const safeSlug =
      slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 80) || "thumb";
    const imgArr = await renderPageAsImage(new Uint8Array(pdfBytes), 1, {
      canvasImport: () => import("@napi-rs/canvas"),
      width: 540,
    });
    const pngBuffer = Buffer.from(imgArr);
    if (pngBuffer.byteLength === 0) return null;

    const fileName = `${safeSlug}.png`;
    const supabase = getSupabaseAdminClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "ssph-resources";

    // Always write locally if writable so local dev/VPS serves fast
    try {
      const relativePath = `thumbnails/${fileName}`;
      const fullPath = resolveSafeStoragePath(relativePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, pngBuffer);
    } catch {
      // Read-only serverless filesystem fallback handled by Supabase upload below
    }

    if (supabase) {
      await supabase.storage
        .from(bucket)
        .upload(`thumbnails/${fileName}`, pngBuffer, {
          contentType: "image/png",
          upsert: true,
        });
    }

    return `/api/thumbnails/${safeSlug}`;
  } catch (err) {
    console.warn("Could not render PDF Page 1 thumbnail:", err);
    return null;
  }
}

export async function readThumbnailPayload(
  slug: string
): Promise<{ kind: "buffer"; buffer: Buffer } | { kind: "signed_url"; url: string } | null> {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 80);
  if (!safeSlug) return null;

  const relativePath = `thumbnails/${safeSlug}.png`;
  try {
    const localFull = resolveSafeStoragePath(relativePath);
    const buf = await fs.readFile(localFull);
    return { kind: "buffer", buffer: buf };
  } catch {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "ssph-resources";
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(relativePath, 3600);
      if (!error && data?.signedUrl) {
        return { kind: "signed_url", url: data.signedUrl };
      }
    }
    return null;
  }
}

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Computes how many initial pages to show in the free book sample preview.
 * Targets 10-15 pages for full books while respecting shorter PDFs so the
 * full document is not given away entirely in preview when longer than 12 pages.
 */
export function computeSamplePageLimit(totalPages: number): number {
  if (totalPages <= 0) return 0;
  if (totalPages <= 12) return totalPages;
  if (totalPages <= 15) return 10;
  return 15;
}

export async function inspectAndCreateSamplePdf(
  pdfBuffer: Buffer,
  slug: string
): Promise<PdfInspectionResult> {
  const srcDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const totalPages = srcDoc.getPageCount();
  const samplePageCount = computeSamplePageLimit(totalPages);

  const embeddedTitle = srcDoc.getTitle()?.trim() || "";
  const embeddedAuthor = srcDoc.getAuthor()?.trim() || "";
  const embeddedSubject = srcDoc.getSubject()?.trim() || "";

  // Slice the very first 10-15 pages into a standalone sample preview PDF
  const sampleDoc = await PDFDocument.create();
  if (samplePageCount > 0) {
    const indices = Array.from({ length: samplePageCount }, (_, idx) => idx);
    const copied = await sampleDoc.copyPages(srcDoc, indices);
    for (const page of copied) {
      sampleDoc.addPage(page);
    }
  }
  sampleDoc.setTitle(`${embeddedTitle || slug} — Sample Preview (First ${samplePageCount} Pages)`);
  sampleDoc.setProducer("SSCSTUDYPREPHUB (SSPH) Preview Builder");

  const sampleBytes = Buffer.from(await sampleDoc.save());

  // Extract readable text from sample pages for TOC/chapter awareness
  let extractedTextSnippet = "";
  try {
    const { extractText } = await import("unpdf");
    const parsed = await extractText(new Uint8Array(sampleBytes), {
      mergePages: true,
    });
    const rawText = Array.isArray(parsed.text) ? parsed.text.join("\n") : parsed.text;
    extractedTextSnippet = (rawText || "").replace(/\s+/g, " ").trim().slice(0, 4500);
  } catch {
    extractedTextSnippet = "";
  }

  const safeSlug =
    slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 80) || "sample";
  const fileName = `${safeSlug}-sample.pdf`;

  // Render Page 1 of the sample PDF into a crisp PNG book cover thumbnail
  const thumbnailUrl = await renderFirstPageThumbnail(sampleBytes, safeSlug);

  const supabase = getSupabaseAdminClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "ssph-resources";
  if (supabase) {
    const objectPath = `samples/${fileName}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, sampleBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (!error) {
      return {
        totalPages,
        samplePageCount,
        sampleStorageType: "SUPABASE",
        sampleStoragePath: objectPath,
        thumbnailUrl,
        embeddedTitle,
        embeddedAuthor,
        embeddedSubject,
        extractedTextSnippet,
      };
    }
  }

  const relativePath = `samples/${fileName}`;
  const fullPath = resolveSafeStoragePath(relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, sampleBytes);

  return {
    totalPages,
    samplePageCount,
    sampleStorageType: "LOCAL",
    sampleStoragePath: relativePath,
    thumbnailUrl,
    embeddedTitle,
    embeddedAuthor,
    embeddedSubject,
    extractedTextSnippet,
  };
}

export async function readSamplePdfPayload(
  sampleStoragePath: string
): Promise<{ kind: "buffer"; buffer: Buffer } | { kind: "signed_url"; url: string }> {
  const supabase = getSupabaseAdminClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "ssph-resources";

  if (supabase && sampleStoragePath.startsWith("samples/")) {
    // Try local first if file exists on disk (for local demo), else Supabase signed URL
    try {
      const localFull = resolveSafeStoragePath(sampleStoragePath);
      const buf = await fs.readFile(localFull);
      return { kind: "buffer", buffer: buf };
    } catch {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(sampleStoragePath, 180);
      if (!error && data?.signedUrl) {
        return { kind: "signed_url", url: data.signedUrl };
      }
    }
  }

  const fullPath = resolveSafeStoragePath(sampleStoragePath);
  const buffer = await fs.readFile(fullPath);
  return { kind: "buffer", buffer };
}
