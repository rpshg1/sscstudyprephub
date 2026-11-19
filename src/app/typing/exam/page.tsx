import type { Metadata } from "next";
import { DestExamRunner } from "@/components/typing/dest-exam-runner";
import {
  generateBreadcrumbSchema,
  generateDestExamSchema,
  generateFaqSchema,
  getSiteBaseUrl,
} from "@/lib/seo-schemas";

const baseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: "Official SSC CGL & CHSL DEST Exam Simulator (2000 Keystrokes) | SSPH",
  description:
    "Simulate official SSC CGL Tier-II (15 min / 2000 key depressions) and CHSL Tier-II (10 min / 1750 key depressions) DEST typing tests with authentic commission error formula and qualifying evaluation.",
  keywords: [
    "SSC CGL DEST typing test online free",
    "SSC CHSL typing test simulator 35 WPM",
    "SSC 2000 key depression test online",
    "SSC typing speed test software free",
    "SSC typing mistake calculation formula",
    "DEST typing test software online practice",
    "Staff Selection Commission typing test pattern",
    "SSC CGL tier 2 typing qualifying cutoff",
  ],
  alternates: {
    canonical: "/typing/exam",
  },
  openGraph: {
    title: "Official SSC CGL & CHSL DEST Typing Simulator | SSPH",
    description:
      "Practice authentic 15-minute 2000 keystroke SSC CGL DEST typing tests with official commission error calculation and category pass/fail cutoff evaluation.",
    url: `${baseUrl}/typing/exam`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SSC CGL & CHSL DEST Typing Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Official SSC CGL & CHSL DEST Typing Simulator | SSPH",
    description:
      "Free 15-min 2000 keystroke SSC DEST exam simulator with commission scoring.",
    images: [`${baseUrl}/og-image.png`],
  },
};

const DEST_EXAM_FAQS = [
  {
    question: "What is the official SSC CGL DEST typing speed formula?",
    answer:
      "SSC CGL Data Entry Skill Test (DEST) mandates transcribing approximately 2,000 key depressions in 15 minutes. This requires a gross typing speed of approximately 27 words per minute (WPM), though scoring 35+ WPM provides a safe margin.",
  },
  {
    question: "What are Full Mistakes vs Half Mistakes in SSC typing evaluations?",
    answer:
      "Full Mistakes (1 penalty point each) include: omission of a word or figure, substitution of a wrong word, and addition of extra words not present in the master text. Half Mistakes (0.5 penalty point each) include: spelling errors, incorrect capitalization (uppercase/lowercase mismatch), punctuation mark omissions, and transposed adjacent letters.",
  },
  {
    question: "What is the maximum permissible error percentage for SSC CGL & CHSL DEST?",
    answer:
      "For SSC CGL and CHSL Tier-II DEST, the cutoff limit is strictly 5.0% error for Unreserved (UR/General) candidates, and 7.0% error for Reserved categories (OBC, EWS, SC, ST, ESM, and PwD). Exceeding this error percentage leads to disqualification.",
  },
];

export default function TypingExamPage() {
  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Touch Typing Course", url: "/typing" },
    { name: "SSC DEST Exam Simulator", url: "/typing/exam" },
  ]);

  const appSchema = generateDestExamSchema();
  const faqSchema = generateFaqSchema(DEST_EXAM_FAQS);

  const schemas = [breadcrumbs, appSchema, faqSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <div className="min-h-screen bg-[#F8FAFC] pb-16 dark:bg-[#070D18]">
        <DestExamRunner />
      </div>
    </>
  );
}
