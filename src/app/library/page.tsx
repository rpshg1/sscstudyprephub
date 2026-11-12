import type { Metadata } from "next";
import { formatExamLabel, formatResourceTypeLabel } from "@/lib/constants";
import { ResourceCatalogSection } from "@/components/resource-catalog-section";

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
      ? `${parts.join(" • ")} — Search & Study PDFs`
      : "Search All SSC Books, PYQs, Roadmaps & Syllabus PDFs";
  const description =
    parts.length > 0
      ? `Browse filtered ${parts.join(" ")} PDFs on SSCStudyPrepHub.`
      : "Search and filter SSC CGL, CHSL, MTS, CPO, and GD books, previous year papers, roadmaps, and syllabus PDFs.";

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
  return (
    <ResourceCatalogSection
      badge="Complete Catalog Search"
      badgeTone="blue"
      title="Search Study Resources"
      subtitle="Search across SSC Books, Study Roadmaps, PYQs, Notes, and Syllabus PDFs."
      basePath="/library"
      showCategoryPills
      searchParams={sp}
    />
  );
}
