import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, SearchX } from "lucide-react";
import { formatExamLabel, formatResourceTypeLabel } from "@/lib/constants";
import { getCachedActiveCategories, listPublicResources } from "@/lib/resources";
import { SearchBar } from "@/components/search-bar";
import { LibraryFilters } from "@/components/library-filters";
import { ResourceCard } from "@/components/resource-card";
import { Badge } from "@/components/ui/primitives";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const exam = typeof sp.exam === "string" && sp.exam !== "ALL" ? sp.exam : "";
  const type = typeof sp.type === "string" && sp.type !== "ALL" ? sp.type : "";
  const category =
    typeof sp.category === "string" && sp.category !== "ALL" ? sp.category : "";

  const parts: string[] = [];
  if (exam) parts.push(formatExamLabel(exam));
  if (type) parts.push(formatResourceTypeLabel(type));
  if (category) parts.push(category.replace(/-/g, " "));
  if (q) parts.push(`"${q}"`);

  const title =
    parts.length > 0
      ? `${parts.join(" • ")} PDFs & Study Material`
      : "Resource Library — SSC Books, Notes, PYQs & Roadmaps";
  const description =
    parts.length > 0
      ? `Browse filtered ${parts.join(" ")} PDFs, study notes, previous year papers, and preparation books on SSCStudyPrepHub.`
      : "Browse 16 subject categories of SSC CGL, CHSL, MTS, CPO, and GD books, study notes, previous year questions, roadmaps, and current affairs PDFs.";

  const canonicalParams = new URLSearchParams();
  if (exam) canonicalParams.set("exam", exam);
  if (type) canonicalParams.set("type", type);
  if (category) canonicalParams.set("category", category);
  const canonicalQuery = canonicalParams.toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalQuery ? `/library?${canonicalQuery}` : "/library",
    },
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const exam = typeof sp.exam === "string" ? sp.exam : "ALL";
  const category = typeof sp.category === "string" ? sp.category : "ALL";
  const subject = typeof sp.subject === "string" ? sp.subject : "ALL";
  const type = typeof sp.type === "string" ? sp.type : "ALL";
  const access = typeof sp.access === "string" ? sp.access : "ALL";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";

  const [categories, resources] = await Promise.all([
    getCachedActiveCategories(),
    listPublicResources({ q, exam, category, subject, type, access, sort, take: 100 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="blue">Digital Study Repository</Badge>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#101B33]">
            SSC Resource Library
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Explore curated books, notes, PYQs, roadmaps, and current affairs across 16
            SSC preparation categories.
          </p>
        </div>

        <div className="w-full lg:max-w-md">
          <SearchBar key={q} initialQuery={q} />
        </div>
      </div>

      {/* Category Pill Strip */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
        <Link
          href="/library"
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            category === "ALL"
              ? "border-[#101B33] bg-[#101B33] text-white"
              : "border-[#E2E8F0] bg-white text-[#172033] hover:bg-slate-50"
          }`}
        >
          All Categories ({categories.length})
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/library?category=${cat.slug}`}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              category === cat.slug
                ? "border-[#2563EB] bg-[#2563EB] text-white"
                : "border-[#E2E8F0] bg-white text-[#172033] hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Multi-Criteria Filters */}
      <div className="mt-4">
        <LibraryFilters
          categories={categories}
          state={{ q, exam, category, type, access, sort }}
        />
      </div>

      {/* Results Count */}
      <div className="mt-6 flex items-center justify-between text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-[#2563EB]" />
          Showing <strong className="text-[#101B33]">{resources.length}</strong>{" "}
          matching resources
        </span>
      </div>

      {/* Results Grid or Empty State */}
      {resources.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
          <SearchX className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-lg font-bold text-[#101B33]">
            No matching study resources found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Try clearing one or more filters or searching with broader keywords like
            &ldquo;Polity&rdquo;, &ldquo;Mathematics&rdquo;, or &ldquo;Roadmap&rdquo;.
          </p>
          <Link
            href="/library"
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Show All Resources
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
