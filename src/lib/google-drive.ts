import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { shortenWithShrinkMeApi } from "@/lib/ads/adapter";
import { inspectAndCreateSamplePdf } from "@/lib/pdf-sample";
import { enrichBookMetadata } from "@/lib/metadata-enricher";
import { validatePdfBuffer } from "@/lib/storage";

interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  description?: string;
  webViewLink?: string;
}

interface ServiceAccountCreds {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

function getServiceAccountCreds(): ServiceAccountCreds | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    const decoded = raw.startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as ServiceAccountCreds;
    if (parsed.client_email && parsed.private_key) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function extractDriveFolderId(raw: string | undefined): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  const urlMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];
  const idParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam) return idParam[1];
  return trimmed;
}

export function getGoogleDriveConfigStatus() {
  const folderId = extractDriveFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID);
  const serviceAccount = getServiceAccountCreds();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim() || "";

  return {
    configured: Boolean(folderId && (serviceAccount || apiKey)),
    folderId: folderId || null,
    authMode: serviceAccount ? "service_account" : apiKey ? "api_key" : "unconfigured",
    serviceAccountEmail: serviceAccount?.client_email || null,
  };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getGoogleAccessToken(): Promise<string | null> {
  const creds = getServiceAccountCreds();
  if (!creds) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString(
    "base64url"
  );
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: creds.client_email,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      aud: creds.token_uri || "https://oauth2.googleapis.com/token",
      exp: nowSec + 3600,
      iat: nowSec,
    })
  ).toString("base64url");

  const unsignedJwt = `${header}.${claimSet}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  const signature = signer.sign(creds.private_key, "base64url");
  const assertion = `${unsignedJwt}.${signature}`;

  const tokenUri = creds.token_uri || "https://oauth2.googleapis.com/token";
  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth token exchange failed: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
  };
  return cachedToken.token;
}

export async function listDriveFolderPdfs(): Promise<DriveFileItem[]> {
  const folderId = extractDriveFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID);
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured.");
  }

  const accessToken = await getGoogleAccessToken();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();

  if (!accessToken && !apiKey) {
    throw new Error(
      "Configure GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_DRIVE_API_KEY in environment variables."
    );
  }

  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set(
    "q",
    `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`
  );
  url.searchParams.set(
    "fields",
    "files(id,name,mimeType,size,modifiedTime,description,webViewLink)"
  );
  url.searchParams.set("orderBy", "modifiedTime desc");
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("supportsAllDrives", "true");
  url.searchParams.set("includeItemsFromAllDrives", "true");
  if (!accessToken && apiKey) {
    url.searchParams.set("key", apiKey);
  }

  const res = await fetch(url.toString(), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Drive API list failed (${res.status}): ${body.slice(0, 240)}`);
  }

  const data = (await res.json()) as { files?: DriveFileItem[] };
  return data.files ?? [];
}

export async function openDriveDownloadStream(fileId: string): Promise<{
  stream: ReadableStream<Uint8Array>;
  contentLength: string | null;
}> {
  const accessToken = await getGoogleAccessToken();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();

  if (accessToken) {
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media&supportsAllDrives=true`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (res.ok && res.body) {
      return {
        stream: res.body as ReadableStream<Uint8Array>,
        contentLength: res.headers.get("content-length"),
      };
    }
  }

  if (apiKey) {
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok && res.body) {
      return {
        stream: res.body as ReadableStream<Uint8Array>,
        contentLength: res.headers.get("content-length"),
      };
    }
  }

  throw new Error(`Could not open streaming download for Google Drive file ${fileId}`);
}

const MAX_DRIVE_PDF_BYTES = 1024 * 1024 * 1024; // 1 GB
const DRIVE_CHUNK_BYTES = 24 * 1024 * 1024; // 24 MB HTTP Range chunks

export interface DriveSyncJobStatus {
  running: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  currentFile: string | null;
  progressText: string | null;
  filesScanned: number;
  filesImported: number;
  filesUpdated: number;
  filesSkipped: number;
  errors: string[];
}

const globalForDriveJob = globalThis as unknown as {
  __ssphDriveSyncJob?: DriveSyncJobStatus;
};

function getJobState(): DriveSyncJobStatus {
  if (!globalForDriveJob.__ssphDriveSyncJob) {
    globalForDriveJob.__ssphDriveSyncJob = {
      running: false,
      startedAt: null,
      finishedAt: null,
      currentFile: null,
      progressText: null,
      filesScanned: 0,
      filesImported: 0,
      filesUpdated: 0,
      filesSkipped: 0,
      errors: [],
    };
  }
  return globalForDriveJob.__ssphDriveSyncJob;
}

export function getDriveSyncJobStatus(): DriveSyncJobStatus {
  return { ...getJobState() };
}

async function fetchDriveChunkWithRetry(
  url: string,
  headers: Record<string, string>,
  start: number,
  end: number
): Promise<Buffer> {
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          Range: `bytes=${start}-${end}`,
        },
        signal: AbortSignal.timeout(90_000),
        cache: "no-store",
      });
      if (res.status === 200 || res.status === 206) {
        return Buffer.from(await res.arrayBuffer());
      }
      lastErr = new Error(`Drive HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, attempt * 1000));
  }
  throw lastErr instanceof Error ? lastErr : new Error("Drive chunk download failed");
}

export async function downloadDriveFileBuffer(
  fileId: string,
  totalBytesHint = 0,
  onProgress?: (downloadedBytes: number, totalBytes: number) => void
): Promise<Buffer> {
  const accessToken = await getGoogleAccessToken();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();

  let targetUrl = "";
  const headers: Record<string, string> = {};

  if (accessToken) {
    targetUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media&supportsAllDrives=true`;
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (apiKey) {
    targetUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media&key=${encodeURIComponent(apiKey)}`;
  } else {
    targetUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
  }

  // Use resilient 24 MB HTTP Range chunks for large PDFs (> 24 MB)
  if (totalBytesHint > DRIVE_CHUNK_BYTES && totalBytesHint <= MAX_DRIVE_PDF_BYTES) {
    const chunks: Buffer[] = [];
    let offset = 0;
    while (offset < totalBytesHint) {
      const end = Math.min(offset + DRIVE_CHUNK_BYTES - 1, totalBytesHint - 1);
      const chunk = await fetchDriveChunkWithRetry(targetUrl, headers, offset, end);
      if (offset === 0 && chunk.subarray(0, 5).toString("ascii") !== "%PDF-") {
        throw new Error("Drive file does not start with a valid %PDF- signature.");
      }
      chunks.push(chunk);
      offset += chunk.byteLength;
      onProgress?.(offset, totalBytesHint);
      if (chunk.byteLength === 0) break;
    }
    return Buffer.concat(chunks);
  }

  const res = await fetch(targetUrl, {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(120_000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to download Google Drive file ${fileId} (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error(
      "Downloaded Drive response is not a direct PDF (check folder sharing or Service Account permissions)."
    );
  }
  return buf;
}

export function buildDriveDirectDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}

function toSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `book-${Date.now()}`
  );
}

function mapSubjectToCategorySlug(subjects: string[], title: string): string {
  const combined = `${subjects.join(" ")} ${title}`.toLowerCase();
  if (/math|quant|algebra|trigonometry|geometry/.test(combined)) return "mathematics";
  if (/english|grammar|vocab/.test(combined)) return "english";
  if (/reason/.test(combined)) return "reasoning";
  if (/polity|constitution/.test(combined)) return "indian-polity";
  if (/history/.test(combined)) return "history";
  if (/geography/.test(combined)) return "geography";
  if (/econom/.test(combined)) return "economics";
  if (/science|physics|chemistry|biology/.test(combined)) return "general-science";
  if (/computer/.test(combined)) return "computer-knowledge";
  if (/current affair/.test(combined)) return "current-affairs";
  if (/roadmap/.test(combined)) return "study-roadmaps";
  if (/previous year|pyq/.test(combined)) return "previous-year-questions";
  return "preparation-books";
}

function mapExamRelevanceToEnum(
  exams: string[]
): "SSC_CGL" | "SSC_CHSL" | "SSC_MTS" | "SSC_CPO" | "SSC_GD" | "ALL_SSC" {
  const joined = exams.join(" ").toUpperCase();
  if (joined.includes("CGL") && joined.includes("CHSL")) return "ALL_SSC";
  if (joined.includes("CGL")) return "SSC_CGL";
  if (joined.includes("CHSL")) return "SSC_CHSL";
  if (joined.includes("MTS")) return "SSC_MTS";
  if (joined.includes("CPO")) return "SSC_CPO";
  if (joined.includes("GD")) return "SSC_GD";
  return "ALL_SSC";
}

export interface DriveSyncSummary {
  status: "SUCCESS" | "FAILED";
  filesScanned: number;
  filesImported: number;
  filesUpdated: number;
  filesSkipped: number;
  importedSlugs: string[];
  errors: string[];
}

export async function syncGoogleDriveFolder(
  trigger = "manual",
  options: { autoPublish?: boolean; maxImportCount?: number } = {}
): Promise<DriveSyncSummary> {
  const autoPublish = options.autoPublish ?? false;
  const maxImportCount = options.maxImportCount ?? 5;
  const errors: string[] = [];
  const importedSlugs: string[] = [];
  let filesScanned = 0;
  let filesImported = 0;
  let filesUpdated = 0;
  let filesSkipped = 0;
  const job = getJobState();

  job.running = true;
  job.startedAt = new Date().toISOString();
  job.finishedAt = null;
  job.currentFile = null;
  job.progressText = "Listing PDFs in Google Drive folder...";
  job.filesScanned = 0;
  job.filesImported = 0;
  job.filesUpdated = 0;
  job.filesSkipped = 0;
  job.errors = [];

  try {
    const rawFiles = await listDriveFolderPdfs();
    // Process smallest PDFs first so smaller books finish fast while larger books follow
    const files = [...rawFiles].sort(
      (a, b) => Number(a.size || 0) - Number(b.size || 0)
    );
    filesScanned = files.length;
    job.filesScanned = filesScanned;

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, slug: true },
    });
    const catMap = new Map(categories.map((c) => [c.slug, c.id]));
    const defaultCatId =
      catMap.get("preparation-books") || categories[0]?.id || "";

    let processedThisRun = 0;
    for (const file of files) {
      try {
        const existing = await prisma.resource.findUnique({
          where: { driveFileId: file.id },
          select: { id: true, slug: true, driveModifiedTime: true, adShortlinkUrl: true },
        });

        const driveModTime = file.modifiedTime ? new Date(file.modifiedTime) : null;
        if (
          existing &&
          driveModTime &&
          existing.driveModifiedTime &&
          existing.driveModifiedTime.getTime() === driveModTime.getTime()
        ) {
          filesSkipped += 1;
          job.filesSkipped = filesSkipped;
          continue;
        }

        if (processedThisRun >= maxImportCount) {
          filesSkipped += 1;
          job.filesSkipped = filesSkipped;
          continue;
        }
        processedThisRun += 1;

        const sizeHintBytes = Number(file.size || 0);
        job.currentFile = file.name;
        job.progressText = `Downloading ${file.name} (${
          sizeHintBytes ? `${Math.round(sizeHintBytes / (1024 * 1024))} MB` : "PDF"
        })...`;

        const pdfBuffer = await downloadDriveFileBuffer(
          file.id,
          sizeHintBytes,
          (doneBytes, totalBytes) => {
            const doneMb = Math.round(doneBytes / (1024 * 1024));
            const totalMb = Math.round(totalBytes / (1024 * 1024));
            job.progressText = `Downloading ${file.name} (${doneMb} / ${totalMb} MB)...`;
          }
        );
        validatePdfBuffer(pdfBuffer, file.name, MAX_DRIVE_PDF_BYTES);

        const sizeMb = pdfBuffer.byteLength / (1024 * 1024);
        const fileSizeLabel =
          sizeMb >= 1
            ? `${sizeMb.toFixed(1)} MB`
            : `${Math.max(1, Math.round(pdfBuffer.byteLength / 1024))} KB`;

        const baseSlug = existing?.slug || toSlug(file.name.replace(/\.pdf$/i, ""));
        const existingSlugConflict = !existing
          ? await prisma.resource.findUnique({
              where: { slug: baseSlug },
              select: { id: true },
            })
          : null;
        const finalSlug = existingSlugConflict
          ? `${baseSlug}-${file.id.slice(0, 6).toLowerCase()}`
          : baseSlug;

        // 1. Slice first 10-15 pages sample preview & extract opening text (resilient fallback)
        job.progressText = `Extracting 15-page sample preview for ${file.name}...`;
        let pdfInspection: {
          totalPages: number;
          samplePageCount: number;
          sampleStoragePath: string | null;
          thumbnailUrl: string | null;
          embeddedTitle: string;
          embeddedAuthor: string;
          extractedTextSnippet: string;
        } = {
          totalPages: 0,
          samplePageCount: 0,
          sampleStoragePath: null,
          thumbnailUrl: null,
          embeddedTitle: "",
          embeddedAuthor: "",
          extractedTextSnippet: "",
        };

        try {
          pdfInspection = await inspectAndCreateSamplePdf(pdfBuffer, finalSlug);
        } catch (sampleErr) {
          console.warn(
            `Sample preview slice skipped for ${file.name}:`,
            sampleErr instanceof Error ? sampleErr.message : sampleErr
          );
        }

        // 2. Search web (Google Books / Open Library / optional Gemini) & build SEO JSON
        job.progressText = `Fetching SEO metadata from Google Books & web for ${file.name}...`;
        const enriched = await enrichBookMetadata({
          rawFileName: file.name,
          title: pdfInspection.embeddedTitle || undefined,
          author: pdfInspection.embeddedAuthor || undefined,
          actualPdfPages: pdfInspection.totalPages || undefined,
          extractedPdfText: pdfInspection.extractedTextSnippet,
        });

        // 3. Direct Google Drive URL (for Paid users) + Auto-Shrink via ShrinkMe.io (for Free users)
        job.progressText = `Creating ShrinkMe.io free link for ${file.name}...`;
        const driveDirectUrl = buildDriveDirectDownloadUrl(file.id);
        let adShortlinkUrl = existing?.adShortlinkUrl || null;
        if (!adShortlinkUrl && process.env.SHRINKME_API_TOKEN?.trim()) {
          adShortlinkUrl = await shortenWithShrinkMeApi(driveDirectUrl);
        }

        const catSlug = mapSubjectToCategorySlug(
          enriched.metadata.subject,
          enriched.metadata.title
        );
        const categoryId = catMap.get(catSlug) || defaultCatId;
        const examCategory = mapExamRelevanceToEnum(enriched.metadata.examRelevance);

        const resourceData = {
          title: enriched.metadata.title,
          description: enriched.metadata.description,
          shortDescription: enriched.metadata.shortDescription || null,
          examCategory,
          resourceType: "BOOK" as const,
          subject: enriched.metadata.subject[0] || "Competitive Exam Prep",
          categoryId,
          coverImageUrl: pdfInspection.thumbnailUrl || enriched.coverThumbnailUrl,
          storageType: "GOOGLE_DRIVE" as const,
          protectedFileUrl: driveDirectUrl,
          driveFileId: file.id,
          driveModifiedTime: driveModTime,
          sampleStoragePath: pdfInspection.sampleStoragePath,
          samplePageCount: pdfInspection.samplePageCount,
          adShortlinkUrl,
          fileFormat: "PDF",
          fileSizeLabel,
          pageCount: enriched.metadata.totalPages || pdfInspection.totalPages,
          authorSource: enriched.metadata.author || "Google Drive Sync",
          author: enriched.metadata.author || null,
          publisher: enriched.metadata.publisher || null,
          yearPublished: enriched.metadata.yearPublished || null,
          language: enriched.metadata.language || "English",
          edition: enriched.metadata.edition || null,
          isbn: enriched.metadata.isbn || null,
          difficulty: enriched.metadata.difficulty || "intermediate",
          genreJson: JSON.stringify(enriched.metadata.genre),
          subjectsJson: JSON.stringify(enriched.metadata.subject),
          examRelevanceJson: JSON.stringify(enriched.metadata.examRelevance),
          tagsJson: JSON.stringify(enriched.metadata.tags),
          seoMetadataJson: JSON.stringify(enriched.metadata),
          accessType: "AD_SUPPORTED" as const,
          isPublished: autoPublish,
          isDemo: false,
        };

        if (existing) {
          await prisma.resource.update({
            where: { id: existing.id },
            data: resourceData,
          });
          filesUpdated += 1;
          job.filesUpdated = filesUpdated;
        } else {
          await prisma.resource.create({
            data: {
              slug: finalSlug,
              ...resourceData,
            },
          });
          filesImported += 1;
          job.filesImported = filesImported;
        }

        importedSlugs.push(finalSlug);
      } catch (fileErr) {
        const msg =
          fileErr instanceof Error ? fileErr.message : "Unknown file sync error";
        errors.push(`${file.name}: ${msg}`);
        job.errors = [...errors];
      }
    }

    await prisma.driveSyncLog.create({
      data: {
        trigger,
        status: errors.length > 0 && filesImported === 0 ? "PARTIAL" : "SUCCESS",
        filesScanned,
        filesImported,
        filesUpdated,
        filesSkipped,
        errorMessage: errors.length > 0 ? errors.join(" | ").slice(0, 1000) : null,
        detailsJson: JSON.stringify({ importedSlugs }),
      },
    });

    job.running = false;
    job.finishedAt = new Date().toISOString();
    job.currentFile = null;
    job.progressText = `Sync finished: ${filesImported} imported, ${filesUpdated} updated, ${filesSkipped} skipped.`;

    return {
      status: "SUCCESS",
      filesScanned,
      filesImported,
      filesUpdated,
      filesSkipped,
      importedSlugs,
      errors,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Google Drive sync failed";
    job.running = false;
    job.finishedAt = new Date().toISOString();
    job.currentFile = null;
    job.progressText = `Sync failed: ${errMsg}`;
    job.errors = [errMsg, ...errors];

    await prisma.driveSyncLog
      .create({
        data: {
          trigger,
          status: "FAILED",
          filesScanned,
          filesImported,
          filesUpdated,
          filesSkipped,
          errorMessage: errMsg.slice(0, 1000),
        },
      })
      .catch(() => {});

    return {
      status: "FAILED",
      filesScanned,
      filesImported,
      filesUpdated,
      filesSkipped,
      importedSlugs,
      errors: [errMsg, ...errors],
    };
  }
}

export function startDriveSyncJob(
  trigger = "admin_manual",
  options: { autoPublish?: boolean; maxImportCount?: number } = {}
): { started: boolean; activeJob: DriveSyncJobStatus } {
  const job = getJobState();
  if (job.running) {
    return { started: false, activeJob: { ...job } };
  }
  job.running = true;
  job.startedAt = new Date().toISOString();
  job.finishedAt = null;
  job.progressText = "Starting Google Drive sync...";
  job.errors = [];

  // Fire-and-forget background execution inside Node server process
  void syncGoogleDriveFolder(trigger, options);

  return { started: true, activeJob: { ...job } };
}

export async function registerDriveWatchWebhook(): Promise<{
  channelId: string;
  expiration: string;
}> {
  const folderId = extractDriveFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const webhookToken = process.env.GOOGLE_DRIVE_WEBHOOK_SECRET?.trim();
  const accessToken = await getGoogleAccessToken();

  if (!folderId || !accessToken) {
    throw new Error(
      "Service Account credentials and GOOGLE_DRIVE_FOLDER_ID are required for Drive push notifications."
    );
  }
  if (!siteUrl || !siteUrl.startsWith("https://")) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTPS domain to register Google Drive push webhooks. Use /api/cron/drive-sync or manual sync locally."
    );
  }

  const channelId = `ssph-drive-${crypto.randomUUID()}`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}/watch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: `${siteUrl}/api/webhooks/google-drive`,
        ...(webhookToken ? { token: webhookToken } : {}),
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Drive files.watch failed (${res.status}): ${txt.slice(0, 240)}`);
  }

  const data = (await res.json()) as { id: string; expiration: string };
  return { channelId: data.id, expiration: data.expiration };
}
