import type { Metadata } from "next";
import { ResourceCatalogSection } from "@/components/resource-catalog-section";

export const metadata: Metadata = {
  title: "Free SSC Study Roadmaps — Direct Download (No Ads)",
  description:
    "Download structured week-by-week SSC CGL, CHSL, MTS, CPO, and GD study roadmaps and timetables completely free with direct PDF access.",
  alternates: { canonical: "/roadmaps" },
};

export default async function RoadmapsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <ResourceCatalogSection
      badge="100% Free • Direct PDF (No Ads)"
      badgeTone="green"
      title="SSC Study Roadmaps"
      subtitle="Download week-by-week study planners, subject schedules, and Tier-I / Tier-II preparation roadmaps directly with zero ads."
      basePath="/roadmaps"
      searchPlaceholder="Search roadmaps by exam or duration..."
      lockedType="ROADMAP"
      emptyTitle="No roadmaps published yet"
      emptyDescription="Free direct-download study roadmaps will appear here as soon as they are published."
      searchParams={sp}
    />
  );
}
