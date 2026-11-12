import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, SearchX } from "lucide-react";
import { getCachedActiveCategories, listPublicResources } from "@/lib/resources";
import { SearchBar } from "@/components/search-bar";
import { LibraryFilters } from "@/components/library-filters";
import { ResourceCard } from "@/components/resource-card";
import { Badge } from "@/components/ui/primitives";

export async function ResourceCatalogSection({
  badge,
  badgeTone = "blue",
  title,
  subtitle,
  basePath,
  searchPlaceholder,
  lockedType,
  lockedCategorySlug,
  showCategoryPills = false,
  emptyTitle,
  emptyDescription,
  topSlot,
  searchParams,
}: {
  badge: string;
  badgeTone?: "navy" | "blue" | "slate" | "green" | "amber" | "red";
  title: string;
  subtitle: string;
  basePath: string;
  searchPlaceholder?: string;
  lockedType?: string;
  lockedCategorySlug?: string;
  showCategoryPills?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  topSlot?: ReactNode;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const exam = typeof searchParams.exam === "string" ? searchParams.exam : "ALL";
  const category =
    lockedCategorySlug ||
    (typeof searchParams.category === "string" ? searchParams.category : "ALL");
  const subject =
    typeof searchParams.subject === "string" ? searchParams.subject : "ALL";
  const type =
    lockedType || (typeof searchParams.type === "string" ? searchParams.type : "ALL");
  const access = typeof searchParams.access === "string" ? searchParams.access : "ALL";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";

  const [categories, resources] = await Promise.all([
    getCachedActiveCategories(),
    listPublicResources({ q, exam, category, subject, type, access, sort, take: 100 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone={badgeTone}>{badge}</Badge>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#101B33]">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="w-full lg:max-w-md">
          <SearchBar
            key={q}
            initialQuery={q}
            basePath={basePath}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>

      {topSlot}

      {showCategoryPills && !lockedCategorySlug && (
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            href={basePath}
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
              href={`${basePath}?category=${cat.slug}`}
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
      )}

      <div className="mt-4">
        <LibraryFilters
          categories={categories}
          state={{ q, exam, category, type, access, sort }}
          basePath={basePath}
          hideTypeFilter={Boolean(lockedType)}
          hideCategoryFilter={Boolean(lockedCategorySlug)}
        />
      </div>

      <div className="mt-6 flex items-center justify-between text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-[#2563EB]" />
          Showing <strong className="text-[#101B33]">{resources.length}</strong>{" "}
          matching items
        </span>
      </div>

      {resources.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
          <SearchX className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-lg font-bold text-[#101B33]">
            {emptyTitle || "No matching study resources found"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            {emptyDescription ||
              "Try clearing one or more filters or explore another SSC section from the top menu."}
          </p>
          <Link
            href={basePath}
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Reset View
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
