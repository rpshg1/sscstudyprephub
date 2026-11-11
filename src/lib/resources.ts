import { prisma } from "@/lib/prisma";
import type { AccessType, ExamCategory, Prisma, ResourceType } from "@prisma/client";

/**
 * Explicitly omits `protectedFileUrl`, `storagePath`, and `adShortlinkUrl`
 * from public listings so storage origins are never leaked in HTML/JSON.
 */
export const PUBLIC_RESOURCE_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  shortDescription: true,
  examCategory: true,
  resourceType: true,
  subject: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  coverImageUrl: true,
  coverAccent: true,
  fileFormat: true,
  fileSizeLabel: true,
  pageCount: true,
  samplePageCount: true,
  authorSource: true,
  author: true,
  publisher: true,
  yearPublished: true,
  language: true,
  edition: true,
  isbn: true,
  difficulty: true,
  genreJson: true,
  subjectsJson: true,
  examRelevanceJson: true,
  tagsJson: true,
  accessType: true,
  isPublished: true,
  isFeatured: true,
  isDemo: true,
  downloadCount: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ResourceSelect;

export type PublicResource = Prisma.ResourceGetPayload<{
  select: typeof PUBLIC_RESOURCE_SELECT;
}>;

export interface ResourceFilterInput {
  q?: string;
  exam?: string;
  category?: string;
  subject?: string;
  type?: string;
  access?: string;
  sort?: string;
  take?: number;
}

export async function listPublicResources(filters: ResourceFilterInput = {}) {
  const where: Prisma.ResourceWhereInput = {
    isPublished: true,
  };

  if (filters.q?.trim()) {
    const term = filters.q.trim();
    where.OR = [
      { title: { contains: term } },
      { description: { contains: term } },
      { subject: { contains: term } },
      { authorSource: { contains: term } },
    ];
  }

  if (filters.exam && filters.exam !== "ALL") {
    where.examCategory = filters.exam as ExamCategory;
  }

  if (filters.type && filters.type !== "ALL") {
    where.resourceType = filters.type as ResourceType;
  }

  if (filters.access && filters.access !== "ALL") {
    where.accessType = filters.access as AccessType;
  }

  if (filters.subject && filters.subject !== "ALL") {
    where.subject = { contains: filters.subject };
  }

  if (filters.category && filters.category !== "ALL") {
    where.category = { slug: filters.category };
  }

  const orderBy: Prisma.ResourceOrderByWithRelationInput[] =
    filters.sort === "popular"
      ? [{ downloadCount: "desc" }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

  return prisma.resource.findMany({
    where,
    select: PUBLIC_RESOURCE_SELECT,
    orderBy,
    take: filters.take ?? 60,
  });
}

export async function getPublicResourceDetailBySlug(slug: string) {
  const resource = await prisma.resource.findUnique({
    where: { slug },
    select: {
      ...PUBLIC_RESOURCE_SELECT,
      adShortlinkUrl: true,
      sampleStoragePath: true,
    },
  });

  if (!resource || !resource.isPublished) {
    return null;
  }

  // Return boolean flags without leaking internal storage origins or Drive file IDs
  const { adShortlinkUrl, sampleStoragePath, ...publicFields } = resource;
  return {
    ...publicFields,
    hasAdShortlink: Boolean(adShortlinkUrl),
    hasSamplePreview: Boolean(sampleStoragePath),
  };
}
