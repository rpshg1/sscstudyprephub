import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");
const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function resolveSafeStoragePath(relativeStoragePath: string): string {
  const cleaned = relativeStoragePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const resolved = path.resolve(STORAGE_ROOT, cleaned);
  if (!resolved.startsWith(STORAGE_ROOT + path.sep)) {
    throw new Error("Invalid storage path traversal attempt");
  }
  return resolved;
}

export function validatePdfBuffer(
  buffer: Buffer,
  originalName: string,
  maxBytes = MAX_PDF_BYTES
): void {
  if (!originalName.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only .pdf files are permitted.");
  }
  if (buffer.byteLength === 0 || buffer.byteLength > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`PDF file size must be between 1 byte and ${maxMb} MB.`);
  }
  const magic = buffer.subarray(0, 5).toString("ascii");
  if (magic !== "%PDF-") {
    throw new Error("Invalid file signature: uploaded file is not a valid PDF.");
  }
}

export async function saveAdminPdfUpload(
  file: File,
  slugHint: string
): Promise<{
  storageType: "LOCAL_DEMO_PDF" | "SUPABASE_STORAGE";
  storagePath: string;
  fileSizeLabel: string;
}> {
  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  validatePdfBuffer(buffer, file.name);

  const safeSlug = slugHint.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 60) || "resource";
  const uniqueName = `${safeSlug}-${crypto.randomBytes(6).toString("hex")}.pdf`;
  const sizeMb = buffer.byteLength / (1024 * 1024);
  const fileSizeLabel =
    sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(buffer.byteLength / 1024))} KB`;

  const supabase = getSupabaseAdminClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "ssph-resources";

  if (supabase) {
    const objectPath = `pdfs/${uniqueName}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }
    return {
      storageType: "SUPABASE_STORAGE",
      storagePath: objectPath,
      fileSizeLabel,
    };
  }

  const relativePath = `uploads/${uniqueName}`;
  const fullPath = resolveSafeStoragePath(relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);

  return {
    storageType: "LOCAL_DEMO_PDF",
    storagePath: relativePath,
    fileSizeLabel,
  };
}

export async function getProtectedResourceDownloadPayload(resource: {
  storageType: "LOCAL_DEMO_PDF" | "EXTERNAL_URL" | "SUPABASE_STORAGE" | "GOOGLE_DRIVE";
  storagePath: string | null;
  protectedFileUrl: string | null;
  driveFileId?: string | null;
}): Promise<
  | { kind: "buffer"; buffer: Buffer }
  | { kind: "stream"; stream: ReadableStream<Uint8Array>; contentLength: string | null }
  | { kind: "signed_url"; url: string }
> {
  if (resource.storageType === "GOOGLE_DRIVE" && resource.driveFileId) {
    const { openDriveDownloadStream } = await import("@/lib/google-drive");
    const { stream, contentLength } = await openDriveDownloadStream(resource.driveFileId);
    return { kind: "stream", stream, contentLength };
  }

  if (resource.storageType === "SUPABASE_STORAGE" && resource.storagePath) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new Error("Supabase Storage credentials are not configured on this server.");
    }
    const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "ssph-resources";
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(resource.storagePath, 90);
    if (error || !data?.signedUrl) {
      throw new Error(`Could not generate signed storage URL: ${error?.message ?? "unknown"}`);
    }
    return { kind: "signed_url", url: data.signedUrl };
  }

  if (resource.storageType === "LOCAL_DEMO_PDF" && resource.storagePath) {
    const fullPath = resolveSafeStoragePath(resource.storagePath);
    const buffer = await fs.readFile(fullPath);
    return { kind: "buffer", buffer };
  }

  if (resource.storageType === "EXTERNAL_URL" && resource.protectedFileUrl) {
    return { kind: "signed_url", url: resource.protectedFileUrl };
  }

  throw new Error("Resource file source is missing or misconfigured.");
}
