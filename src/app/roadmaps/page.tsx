import type { Metadata } from "next";
import { ResourceCatalogSection } from "@/components/resource-catalog-section";
import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  getSiteBaseUrl,
} from "@/lib/seo-schemas";
import { BRAND } from "@/lib/constants";

const baseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: "Free SSC Study Roadmaps — Direct Download (No Ads) | SSPH",
  description:
    "Download free week-by-week SSC CGL, CHSL, MTS & CPO study roadmaps, 90-day revision timetables, and daily strategy plans on SSPH.",
  keywords: [
    "SSC CGL preparation roadmap PDF",
    "SSC CGL 6 months study plan PDF download",
    "SSC CHSL 90 days study timetable PDF",
    "SSC daily study routine for working aspirants",
    "SSC CGL self study roadmap Tier 1 Tier 2",
    "SSC MTS preparation strategy roadmap",
    "free SSC study plan direct download",
  ],
  alternates: {
    canonical: "/roadmaps",
  },
  openGraph: {
    title: "Free SSC Study Roadmaps — Direct Download (No Ads) | SSPH",
    description:
      "Structured week-by-week study planners, subject schedules, and Tier-I & Tier-II preparation roadmaps directly downloadable with zero ads.",
    url: `${baseUrl}/roadmaps`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SSC Preparation Study Roadmaps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SSC Study Roadmaps — Direct Download | SSPH",
    description:
      "Download structured week-by-week study planners for SSC CGL, CHSL, and MTS directly.",
    images: [`${baseUrl}/og-image.png`],
  },
};

const ROADMAPS_FAQS = [
  {
    question: "How should a beginner start preparing for SSC CGL using roadmaps?",
    answer:
      "Beginners should start with a 6-month structured roadmap: Month 1-3 focuses on concept foundation across Arithmetic, Advance Maths, English Grammar, and Basic Reasoning; Month 4 covers subject-wise syllabus completion and daily touch typing practice; Month 5 is dedicated to chapter-wise PYQs; Month 6 focuses on full-length mock tests and Tier-II revision.",
  },
  {
    question: "Can I crack SSC CGL in 90 days with a targeted roadmap?",
    answer:
      "Yes, if your basic school-level concepts are clear, a disciplined 90-day roadmap focusing on high-weightage topics (Algebra, Geometry, Trigonometry, Comprehension, Syllogisms, and Current Affairs) paired with daily 1-hour mock test analysis can yield qualifying scores.",
  },
  {
    question: "Are these study roadmaps completely free with direct download?",
    answer:
      "Yes. All SSPH preparation roadmaps are available for 100% free direct download without any ads, subscriptions, or paywalls.",
  },
];

export default async function RoadmapsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Study Roadmaps", url: "/roadmaps" },
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SSC Preparation Roadmaps & Study Schedules",
    description:
      "Free downloadable week-by-week study roadmaps, timelines, and subject planners for SSC CGL, CHSL, and MTS aspirants.",
    url: `${baseUrl}/roadmaps`,
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
    },
  };

  const faqSchema = generateFaqSchema(ROADMAPS_FAQS);
  const schemas = [breadcrumbs, collectionSchema, faqSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
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
    </>
  );
}
