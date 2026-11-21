import type { Metadata } from "next";
import { TypingHubClient } from "@/components/typing/typing-hub-client";
import {
  generateBreadcrumbSchema,
  generateCourseSchema,
  generateFaqSchema,
  getSiteBaseUrl,
} from "@/lib/seo-schemas";

const baseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: "Free Touch Typing Course (365+ Chapters) & SSC DEST Simulator | SSPH",
  description:
    "Learn touch typing from scratch with 365 daily lessons, live finger placement guides, virtual keyboard, and official SSC DEST exam simulators on SSPH.",
  keywords: [
    "touch typing course free 365 chapters",
    "SSC CGL typing test online practice",
    "SSC CHSL typing practice 35 WPM",
    "learn touch typing from scratch online",
    "SSC 2000 key depressions DEST simulator",
    "home row typing practice free",
    "typing speed test for government exams",
    "SSC typing mistake formula calculator",
    "keyboard finger placement guide online",
  ],
  alternates: {
    canonical: "/typing",
  },
  openGraph: {
    title: "Free Touch Typing Course & SSC DEST Simulator (365+ Chapters) | SSPH",
    description:
      "Master touch typing from scratch to 50+ WPM with 8 progressive stages, interactive finger guides, and official SSC commission exam simulators.",
    url: `${baseUrl}/typing`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SSPH Touch Typing Course & SSC DEST Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Touch Typing Course & SSC DEST Simulator | SSPH",
    description:
      "Interactive 365-chapter typing curriculum with virtual keyboard and SSC CGL/CHSL DEST simulators.",
    images: [`${baseUrl}/og-image.png`],
  },
};

const TYPING_FAQS = [
  {
    question: "What typing speed is required to qualify the SSC CGL Tier-II DEST test?",
    answer:
      "For SSC CGL DEST, candidates must complete 2,000 key depressions in 15 minutes, which equates to approximately 27 WPM (minimum qualifying) and 35+ WPM (recommended). Error percentage must be strictly under 5% for Unreserved (UR) candidates and under 7% for Reserved categories (OBC, SC, ST, EWS).",
  },
  {
    question: "What is the typing speed requirement for SSC CHSL?",
    answer:
      "For SSC CHSL Tier-II DEST, English medium typing requires 35 WPM (1,750 key depressions in 10 minutes) with permissible error under 7% for UR and 10% for Reserved categories. Hindi medium typing requires 30 WPM (1,500 key depressions in 10 minutes).",
  },
  {
    question: "How does the 365-chapter SSPH Touch Typing curriculum work?",
    answer:
      "The curriculum is organized into 8 progressive master stages: Stage 1 covers Home Row posture and F/J bumps (Ch. 1-40); Stage 2 unlocks Top Row vowels and consonants (Ch. 41-90); Stage 3 masters Bottom Row keys and punctuation (Ch. 91-145); Stage 4 teaches opposite-hand Shift capitalization (Ch. 146-195); Stage 5 introduces Number Row reaches (Ch. 196-250); Stage 6 drills SSC high-frequency exam vocabulary (Ch. 251-305); Stage 7 develops paragraph fluency and backspace control (Ch. 306-345); and Stage 8 provides authentic SSC CGL and CHSL exam simulators (Ch. 346-365+).",
  },
  {
    question: "Is this typing course completely free?",
    answer:
      "Yes. The entire 365-chapter touch typing curriculum, interactive virtual keyboard, hand-placement guides, and official SSC DEST simulator are 100% free with no hidden fees or subscriptions.",
  },
];

export default function TypingPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Touch Typing Course", url: "/typing" },
  ]);

  const courseSchema = generateCourseSchema();
  const faqSchema = generateFaqSchema(TYPING_FAQS);

  const schemas = [breadcrumbSchema, courseSchema, faqSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <TypingHubClient />
    </>
  );
}
