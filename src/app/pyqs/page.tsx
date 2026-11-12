import type { Metadata } from "next";
import { ResourceCatalogSection } from "@/components/resource-catalog-section";

export const metadata: Metadata = {
  title: "SSC Previous Year Question Papers (PYQs) — Solved PDFs",
  description:
    "Download shift-wise and chapter-wise SSC CGL, CHSL, MTS, CPO, and GD previous year question papers (PYQs) with solutions.",
  alternates: { canonical: "/pyqs" },
};

export default async function PyqsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <ResourceCatalogSection
      badge="Solved Shift & Chapter Papers"
      badgeTone="blue"
      title="Previous Year Question Papers (PYQs)"
      subtitle="Practice authentic TCS-pattern SSC CGL, CHSL, MTS, CPO, and GD previous year solved paper sets."
      basePath="/pyqs"
      searchPlaceholder="Search PYQ papers by exam, year, or subject..."
      lockedType="PYQ"
      emptyTitle="No PYQ papers match these filters"
      emptyDescription="Try resetting filters or browse SSC PYQ compendiums inside the Books section."
      searchParams={sp}
    />
  );
}
