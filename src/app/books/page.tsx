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
  title: "SSC Books — Free Preparation Books & Reference PDFs | SSPH",
  description:
    "Download free SSC CGL, CHSL, MTS & CPO preparation books, notes, and formula handbooks for Maths, English, Reasoning, and Static GK on SSPH.",
  keywords: [
    "SSC CGL books PDF free download",
    "SSC CHSL preparation books PDF",
    "SSC maths books PDF download",
    "SSC English vocabulary books PDF",
    "SSC reasoning chapterwise books",
    "SSC general awareness GK books PDF",
    "Pinnacle SSC books PDF",
    "Blackbook of English vocabulary PDF",
    "Neetu Singh English volume 1 2 PDF",
    "Rakesh Yadav class notes maths PDF",
    "SSC MTS study books free",
  ],
  alternates: {
    canonical: "/books",
  },
  openGraph: {
    title: "SSC Books — Free Preparation Books & Reference PDFs | SSPH",
    description:
      "Curated library of standard preparation textbooks and subject compendiums for SSC CGL, CHSL, MTS, and CPO aspirants.",
    url: `${baseUrl}/books`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SSC Preparation Books Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSC Books — Free Preparation Books & Reference PDFs | SSPH",
    description:
      "Curated library of standard preparation textbooks for SSC CGL, CHSL, MTS, and CPO aspirants.",
    images: [`${baseUrl}/og-image.png`],
  },
};

const BOOKS_FAQS = [
  {
    question: "Are the SSC preparation books on SSPH completely free to access?",
    answer:
      "Yes, all curated SSC textbooks and reference compendiums indexed on SSPH are free to read online or download. You can preview sample pages or download the complete PDF.",
  },
  {
    question: "Which books are recommended for SSC CGL Mathematics?",
    answer:
      "For SSC CGL Quantitative Aptitude, standard recommended resources include Pinnacle SSC Mathematics 6800+ TCS MCQ book, Rakesh Yadav Class Notes / Advance Maths, and Kiran SSC Mathematics chapter-wise solved papers.",
  },
  {
    question: "Which books are best for SSC CGL English Comprehension?",
    answer:
      "For English Language & Comprehension, top student favorites include Neetu Singh Plinth to Paramount (Volume 1 & 2), Blackbook of English Vocabulary by Nikhil Gupta, and SP Bakshi Objective General English.",
  },
];

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "SSC Books", url: "/books" },
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SSC Preparation Books & Reference Library",
    description:
      "Comprehensive catalog of subject-wise textbooks, formula guides, and exam reference PDFs for SSC CGL, CHSL, MTS, and CPO aspirants.",
    url: `${baseUrl}/books`,
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
    },
  };

  const faqSchema = generateFaqSchema(BOOKS_FAQS);
  const schemas = [breadcrumbs, collectionSchema, faqSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <ResourceCatalogSection
        badge="SSC Preparation Books"
        badgeTone="blue"
        title="SSC Books"
        subtitle="Browse subject-wise books and exam reference PDFs for SSC CGL, CHSL, MTS, CPO, and GD."
        basePath="/books"
        searchPlaceholder="Search SSC books by title, author, or subject..."
        lockedType="BOOK"
        showCategoryPills
        searchParams={sp}
      />
    </>
  );
}
