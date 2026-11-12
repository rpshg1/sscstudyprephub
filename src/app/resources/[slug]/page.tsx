import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Layers,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { evaluateResourceAccess } from "@/lib/access";
import {
  BRAND,
  formatAccessTypeLabel,
  formatExamLabel,
  formatResourceTypeLabel,
} from "@/lib/constants";
import { getPublicResourceDetailBySlug, listPublicResources } from "@/lib/resources";
import { Badge, Card } from "@/components/ui/primitives";
import { ResourceCover } from "@/components/resource-cover";
import { DownloadFlow } from "@/components/download-flow";
import { ResourceCard } from "@/components/resource-card";
import { SamplePreviewViewer } from "@/components/sample-preview-viewer";

export const revalidate = 120;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

function parseJsonStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://sscstudyprephub-rpqv.vercel.app"
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getPublicResourceDetailBySlug(slug);
  if (!resource) {
    return { title: "Resource Not Found" };
  }
  const baseUrl = getSiteBaseUrl();
  const metaDesc = (resource.shortDescription || resource.description).slice(0, 155);
  const tags = parseJsonStringArray(resource.tagsJson);
  const coverUrl = resource.coverImageUrl
    ? resource.coverImageUrl.startsWith("http")
      ? resource.coverImageUrl
      : `${baseUrl}${resource.coverImageUrl}`
    : `${baseUrl}/og-image.png`;

  return {
    title: `${resource.title} — ${formatExamLabel(resource.examCategory)} PDF`,
    description: metaDesc,
    keywords: tags.length > 0 ? tags : [resource.subject, formatExamLabel(resource.examCategory), "SSC PDF"],
    alternates: { canonical: `/resources/${resource.slug}` },
    openGraph: {
      title: `${resource.title} | ${BRAND.shortName}`,
      description: metaDesc,
      url: `${baseUrl}/resources/${resource.slug}`,
      type: "article",
      images: [
        {
          url: coverUrl,
          width: resource.coverImageUrl ? 360 : 1200,
          height: resource.coverImageUrl ? 500 : 630,
          alt: resource.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${resource.title} | ${BRAND.shortName}`,
      description: metaDesc,
      images: [coverUrl],
    },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getPublicResourceDetailBySlug(slug);
  if (!resource) {
    notFound();
  }

  const baseUrl = getSiteBaseUrl();
  const accessSummary = evaluateResourceAccess({
    accessType: resource.accessType,
    user: null,
    alreadyUnlocked: false,
  });

  const related = (
    await listPublicResources({ category: resource.category.slug, take: 5 })
  )
    .filter((item) => item.id !== resource.id)
    .slice(0, 4);

  const accessBadgeTone =
    resource.accessType === "FREE"
      ? "green"
      : resource.accessType === "AD_SUPPORTED"
        ? "blue"
        : "navy";

  const tags = parseJsonStringArray(resource.tagsJson);
  const coverAbsoluteUrl = resource.coverImageUrl
    ? resource.coverImageUrl.startsWith("http")
      ? resource.coverImageUrl
      : `${baseUrl}${resource.coverImageUrl}`
    : undefined;

  const resourceJsonLd = {
    "@context": "https://schema.org",
    "@type":
      resource.resourceType === "BOOK"
        ? ["Book", "LearningResource"]
        : "LearningResource",
    name: resource.title,
    description: resource.shortDescription || resource.description,
    url: `${baseUrl}/resources/${resource.slug}`,
    image: coverAbsoluteUrl,
    inLanguage: resource.language || "English",
    bookEdition: resource.edition || undefined,
    isbn: resource.isbn || undefined,
    numberOfPages: resource.pageCount || undefined,
    datePublished: resource.yearPublished ? String(resource.yearPublished) : undefined,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
    educationalLevel: formatExamLabel(resource.examCategory),
    learningResourceType: formatResourceTypeLabel(resource.resourceType),
    isAccessibleForFree: resource.accessType !== "PREMIUM",
    author: {
      "@type": "Organization",
      name: resource.author || resource.authorSource,
    },
    publisher: {
      "@type": "Organization",
      name: resource.publisher || resource.authorSource,
    },
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
    },
  };

  const sectionHref =
    resource.resourceType === "ROADMAP"
      ? "/roadmaps"
      : resource.resourceType === "PYQ"
        ? "/pyqs"
        : resource.category.slug === "syllabus"
          ? "/syllabus"
          : "/books";

  const sectionLabel =
    resource.resourceType === "ROADMAP"
      ? "Roadmaps"
      : resource.resourceType === "PYQ"
        ? "PYQs"
        : resource.category.slug === "syllabus"
          ? "Syllabus"
          : "Books";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: sectionLabel,
        item: `${baseUrl}${sectionHref}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: resource.category.name,
        item: `${baseUrl}/books?category=${encodeURIComponent(resource.category.slug)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: resource.title,
        item: `${baseUrl}/resources/${resource.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([resourceJsonLd, breadcrumbJsonLd]),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500"
          >
            <Link href="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href={sectionHref} className="hover:text-[#2563EB]">
              {sectionLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link
              href={`/books?category=${encodeURIComponent(resource.category.slug)}`}
              className="hover:text-[#2563EB]"
            >
              {resource.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-[#101B33] line-clamp-1 max-w-[220px] sm:max-w-sm">
              {resource.title}
            </span>
          </nav>

          <Link
            href={sectionHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#2563EB]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {sectionLabel}
          </Link>
        </div>

        <Card className="mt-5 p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Cover */}
            <div className="lg:col-span-4">
              <ResourceCover
                title={resource.title}
                subject={resource.subject}
                examCategory={resource.examCategory}
                resourceType={resource.resourceType}
                coverImageUrl={resource.coverImageUrl}
                coverAccent={resource.coverAccent}
                isDemo={resource.isDemo}
              />
            </div>

            {/* Details */}
            <div className="flex flex-col lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={accessBadgeTone}>
                  {formatAccessTypeLabel(resource.accessType)}
                </Badge>
                <Badge tone="slate">{formatExamLabel(resource.examCategory)}</Badge>
                <Badge tone="slate">{resource.category.name}</Badge>
                {resource.isDemo && <Badge tone="amber">DEMO Sample Resource</Badge>}
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#101B33] sm:text-3xl">
                {resource.title}
              </h1>

              {resource.shortDescription && (
                <p className="mt-2 text-sm font-semibold text-[#2563EB]">
                  {resource.shortDescription}
                </p>
              )}

              <div className="mt-4 space-y-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                {resource.description}
              </div>

              {/* Metadata Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-4">
                <div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <BookOpen className="h-3.5 w-3.5" />
                    Subject
                  </span>
                  <p className="mt-1 text-sm font-bold text-[#101B33]">
                    {resource.subject}
                  </p>
                </div>

                <div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <FileText className="h-3.5 w-3.5" />
                    File Info
                  </span>
                  <p className="mt-1 text-sm font-bold text-[#101B33]">
                    {resource.fileFormat} • {resource.fileSizeLabel}
                  </p>
                </div>

                <div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <Layers className="h-3.5 w-3.5" />
                    Length
                  </span>
                  <p className="mt-1 text-sm font-bold text-[#101B33]">
                    {resource.pageCount ? `${resource.pageCount} Pages` : "Study PDF"}
                  </p>
                </div>

                <div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <UserCheck className="h-3.5 w-3.5" />
                    Author / Source
                  </span>
                  <p className="mt-1 truncate text-sm font-bold text-[#101B33]">
                    {resource.author || resource.authorSource}
                  </p>
                </div>

                {resource.publisher && (
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Publisher
                    </span>
                    <p className="mt-1 text-xs font-bold text-[#101B33]">
                      {resource.publisher}
                    </p>
                  </div>
                )}

                {resource.edition && (
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Edition
                    </span>
                    <p className="mt-1 text-xs font-bold text-[#101B33]">
                      {resource.edition}
                    </p>
                  </div>
                )}

                {resource.yearPublished ? (
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Year
                    </span>
                    <p className="mt-1 text-xs font-bold text-[#101B33]">
                      {resource.yearPublished}
                    </p>
                  </div>
                ) : null}

                {resource.isbn && (
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      ISBN
                    </span>
                    <p className="mt-1 font-mono text-xs font-bold text-[#101B33]">
                      {resource.isbn}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Difficulty &amp; Language
                  </span>
                  <p className="mt-1 text-xs font-bold capitalize text-[#101B33]">
                    {resource.difficulty} • {resource.language}
                  </p>
                </div>
              </div>

              {/* Exam Relevance & Search Tags */}
              {(() => {
                const examTags = parseJsonStringArray(resource.examRelevanceJson);
                const subjectTags = parseJsonStringArray(resource.subjectsJson);
                const searchTags = parseJsonStringArray(resource.tagsJson);
                if (!examTags.length && !subjectTags.length && !searchTags.length) {
                  return null;
                }
                return (
                  <div className="mt-4 space-y-2 text-xs">
                    {examTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-500">Exam Relevance:</span>
                        {examTags.map((item) => (
                          <Badge key={item} tone="blue">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {subjectTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-500">Topics:</span>
                        {subjectTags.map((item) => (
                          <Badge key={item} tone="slate">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {searchTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-500">Tags:</span>
                        {searchTags.slice(0, 8).map((tag) => (
                          <Link
                            key={tag}
                            href={`/library?q=${encodeURIComponent(tag)}`}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-blue-50 hover:text-[#2563EB]"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Access Status Box */}
              <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-xs">
                {accessSummary.canDownloadDirectly ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="font-medium text-emerald-900">
                      {accessSummary.unlockReason === "LIFETIME_PREMIUM"
                        ? "Unlocked via your Lifetime Premium membership — direct PDF access."
                        : accessSummary.unlockReason === "ALREADY_UNLOCKED"
                          ? "Previously unlocked in your account — download anytime without extra credits."
                          : "Open free resource — direct PDF download available."}
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#2563EB]" />
                    <span className="text-slate-700">
                      Protected delivery via short-lived signed URLs.{" "}
                      {resource.accessType === "AD_SUPPORTED"
                        ? "Free via verified advertisement link."
                        : "Paid memberships are currently paused."}
                    </span>
                  </>
                )}
              </div>

              {/* Action Controls */}
              <div className="mt-6">
                <DownloadFlow
                  resourceId={resource.id}
                  resourceTitle={resource.title}
                  accessType={resource.accessType}
                  accessSummary={accessSummary}
                  initialSaved={false}
                  isLoggedIn={false}
                  bookCredits={0}
                  adProvider={resource.adProvider}
                />
              </div>

              <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs text-slate-600 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Downloads recorded: {resource.downloadCount.toLocaleString()}</span>
                  <Link
                    href={`/contact?type=COPYRIGHT_DMCA&slug=${encodeURIComponent(resource.slug)}`}
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    Request removal / report copyright concern
                  </Link>
                </div>
                <p className="border-t border-[#E2E8F0] pt-2 leading-relaxed">
                  <strong>Support &amp; Book Removal:</strong> For help or if you are an
                  author/publisher requesting removal of this resource, email{" "}
                  <a
                    href={`mailto:${BRAND.copyrightEmail}?subject=${encodeURIComponent(`Book Removal Request: ${resource.title}`)}`}
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    {BRAND.copyrightEmail}
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </Card>

        {resource.hasSamplePreview && resource.samplePageCount && (
          <SamplePreviewViewer
            resourceId={resource.id}
            resourceTitle={resource.title}
            samplePageCount={resource.samplePageCount}
            totalPages={resource.pageCount}
          />
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#101B33]">
              More in {resource.category.name}
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ResourceCard key={item.id} resource={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
