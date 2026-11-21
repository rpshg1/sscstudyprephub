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
  title: "SSC Previous Year Question Papers (PYQs) — Solved PDFs | SSPH",
  description:
    "Download official TCS shift-wise SSC CGL, CHSL, MTS, CPO & GD solved papers with verified commission answer keys and math solutions on SSPH.",
  keywords: [
    "SSC CGL previous year question papers PDF with solution",
    "SSC CHSL PYQ solved papers download",
    "SSC MTS shift wise question papers PDF",
    "SSC CPO previous year solved papers PDF",
    "TCS pattern SSC question papers PDF",
    "SSC GD Constable previous year papers",
    "SSC maths chapter wise PYQ PDF",
    "SSC English PYQ with solutions PDF",
    "SSC reasoning solved papers download",
  ],
  alternates: {
    canonical: "/pyqs",
  },
  openGraph: {
    title: "SSC Previous Year Question Papers (PYQs) — Solved PDFs | SSPH",
    description:
      "Practice authentic TCS-pattern SSC CGL, CHSL, MTS, and CPO previous year solved shift papers with comprehensive solutions.",
    url: `${baseUrl}/pyqs`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SSC Previous Year Solved Papers (PYQs)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSC Previous Year Question Papers (PYQs) | SSPH",
    description:
      "Download authentic solved TCS-pattern SSC CGL, CHSL, and MTS shift papers.",
    images: [`${baseUrl}/og-image.png`],
  },
};

const PYQS_FAQS = [
  {
    question: "Why are previous year question papers (PYQs) essential for SSC exams?",
    answer:
      "TCS frequently repeats question concepts, idioms, grammar rules, and mathematical problem archetypes across SSC shifts. Practicing authentic PYQs familiarizes you with time management, question distribution, and the exact difficulty level of Tier-I and Tier-II.",
  },
  {
    question: "How many years of PYQs should I solve for SSC CGL 2025/2026?",
    answer:
      "Aspirants are strongly recommended to solve all TCS-conducted shifts from 2018 to the most recent exam cycle. This gives you coverage of over 6,000+ authentic questions across Mathematics, English, Reasoning, and General Awareness.",
  },
  {
    question: "Are solutions and answer keys included with the PYQ PDFs?",
    answer:
      "Yes, the PYQ sets indexed on SSPH include verified commission answer keys along with step-by-step mathematical explanations and grammatical rationales.",
  },
];

export default async function PyqsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Previous Year Papers", url: "/pyqs" },
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SSC Previous Year Question Papers (PYQs) Library",
    description:
      "Solved shift papers and chapter-wise question compilations for SSC CGL, CHSL, MTS, and CPO examinations.",
    url: `${baseUrl}/pyqs`,
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
    },
  };

  const faqSchema = generateFaqSchema(PYQS_FAQS);
  const schemas = [breadcrumbs, collectionSchema, faqSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
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
    </>
  );
}
