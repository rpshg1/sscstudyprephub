import type { Metadata } from "next";
import { Card } from "@/components/ui/primitives";
import { ensureSyllabusCategory } from "@/lib/resources";
import { ResourceCatalogSection } from "@/components/resource-catalog-section";
import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  getSiteBaseUrl,
} from "@/lib/seo-schemas";
import { BRAND } from "@/lib/constants";

const baseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: "SSC Exam Syllabus 2025-2026 — CGL, CHSL, MTS, CPO & GD Pattern + PDFs | SSPH",
  description:
    "Complete Staff Selection Commission (SSC) Tier-I & Tier-II syllabus breakdown, topic-wise weightage, marking scheme, and free downloadable syllabus PDFs for SSC CGL, CHSL, MTS, CPO, and GD.",
  keywords: [
    "SSC CGL syllabus 2025 2026 Tier 1 Tier 2 PDF",
    "SSC CHSL syllabus topic wise PDF download",
    "SSC MTS syllabus and exam pattern PDF",
    "SSC CPO syllabus Paper 1 Paper 2",
    "SSC GD Constable syllabus in Hindi English PDF",
    "SSC exam negative marking scheme 2025",
    "SSC CGL DEST typing test syllabus",
    "SSC quantitative aptitude syllabus topicwise",
  ],
  alternates: {
    canonical: "/syllabus",
  },
  openGraph: {
    title: "SSC Exam Syllabus 2025-2026 — Tier-I & Tier-II Pattern + PDFs | SSPH",
    description:
      "Detailed topic-wise syllabus, examination scheme, and downloadable syllabus PDFs for SSC CGL, CHSL, MTS, CPO, and GD.",
    url: `${baseUrl}/syllabus`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SSC Exam Syllabus & Pattern Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSC Exam Syllabus 2025-2026 | SSPH",
    description:
      "Detailed topic-wise syllabus and exam schemes for SSC CGL, CHSL, MTS, and CPO.",
    images: [`${baseUrl}/og-image.png`],
  },
};

const SSC_SYLLABUS_OVERVIEW = [
  {
    exam: "SSC CGL (Tier-I & Tier-II)",
    pattern: "Tier-I: 100 Qs / 200 Marks (60 min) • Tier-II Paper-I: Maths, Reasoning, English, GA + Computer & DEST",
    topics:
      "Arithmetic & Advanced Maths (Geometry, Algebra, Trig), English Comprehension & Grammar, General Intelligence, History, Polity, Economy, Science, Static GK.",
  },
  {
    exam: "SSC CHSL (10+2 Level)",
    pattern: "Tier-I: 100 Qs / 200 Marks (60 min) • Tier-II Objective + Computer & Typing Skill Test",
    topics:
      "Basic Arithmetic, Mensuration, Elementary Algebra, Grammar & Vocab, Cloze Test, Verbal/Non-Verbal Reasoning, Current Affairs & NCERT General Awareness.",
  },
  {
    exam: "SSC MTS & Havaldar",
    pattern: "Session-I (Maths + Reasoning: 40 Qs, No Negative) • Session-II (GA + English: 50 Qs, -1 Negative)",
    topics:
      "Number System, Percentage, Profit/Loss, Ratio, Coding-Decoding, Series, Static GK, Modern History, Polity, Common Errors & Idioms.",
  },
  {
    exam: "SSC CPO (SI in Delhi Police & CAPFs)",
    pattern: "Paper-I: 200 Qs / 200 Marks (2 hrs) • PET/PST • Paper-II: 200 English Qs / 200 Marks",
    topics:
      "Quantitative Aptitude, General Intelligence, General Awareness, and intensive English Grammar, Comprehension, Active/Passive & Narration for Paper-II.",
  },
  {
    exam: "SSC GD Constable",
    pattern: "80 Questions / 160 Marks (60 min) — 20 Qs each from Reasoning, GK/GS, Elementary Maths, English/Hindi",
    topics:
      "Elementary Maths (BODMAS, Ratio, SI/CI, Mensuration), Basic Reasoning, Static GK, Current Affairs, Hindi/English Comprehension & Vocabulary.",
  },
] as const;

const SYLLABUS_FAQS = [
  {
    question: "What is the new pattern of SSC CGL Tier-II Examination?",
    answer:
      "SSC CGL Tier-II Paper-I is conducted in two sessions on the same day: Section I (Mathematical Abilities: 30 Qs & Reasoning: 30 Qs = 180 marks); Section II (English: 45 Qs & General Awareness: 25 Qs = 210 marks); Section III (Computer Knowledge Module: 20 Qs, qualifying); and Session II (Data Entry Speed Test / DEST: 2000 keystrokes in 15 minutes, qualifying).",
  },
  {
    question: "Is there negative marking in SSC CGL exams?",
    answer:
      "Yes. In Tier-I, there is a negative marking of 0.50 marks for each wrong answer. In Tier-II Paper-I, there is 1 negative mark deducted for each incorrect answer in Section-I, Section-II, and Section-III (Computer).",
  },
  {
    question: "Is the Computer Knowledge module and DEST typing test mandatory for all SSC CGL posts?",
    answer:
      "Yes, both the Computer Knowledge Test (CKT) and the Data Entry Skill Test (DEST) are mandatory for all Group B and Group C posts in SSC CGL, though qualifying cutoffs are set higher for specific posts like ASO in CSS, MEA, and Tax Assistant.",
  },
];

export default async function SyllabusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await ensureSyllabusCategory().catch(() => {});
  const sp = await searchParams;

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Exam Syllabus", url: "/syllabus" },
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SSC Examination Syllabus & Pattern Compendium",
    description:
      "Detailed topic-wise syllabus, exam scheme, and downloadable syllabus PDFs for SSC CGL, CHSL, MTS, CPO, and GD exams.",
    url: `${baseUrl}/syllabus`,
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
    },
  };

  const faqSchema = generateFaqSchema(SYLLABUS_FAQS);
  const schemas = [breadcrumbs, collectionSchema, faqSchema];

  const syllabusGuide = (
    <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {SSC_SYLLABUS_OVERVIEW.map((item) => (
        <Card key={item.exam} className="p-5 space-y-2">
          <h2 className="text-base font-bold text-[#101B33]">{item.exam}</h2>
          <p className="text-xs font-semibold text-[#2563EB]">{item.pattern}</p>
          <p className="text-xs leading-relaxed text-slate-600">{item.topics}</p>
        </Card>
      ))}
    </section>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <ResourceCatalogSection
        badge="100% Free • SSC Exam Syllabus"
        badgeTone="green"
        title="SSC Exam Syllabus & PDFs"
        subtitle="Review Tier-I & Tier-II exam patterns across SSC CGL, CHSL, MTS, CPO, and GD, and download official-topic syllabus PDFs."
        basePath="/syllabus"
        searchPlaceholder="Search syllabus PDFs by exam or subject..."
        lockedCategorySlug="syllabus"
        topSlot={syllabusGuide}
        emptyTitle="No downloadable syllabus PDFs uploaded yet"
        emptyDescription="Use the exam pattern cards above, or upload downloadable Syllabus PDFs from Admin -> Add Free Syllabus."
        searchParams={sp}
      />
    </>
  );
}
