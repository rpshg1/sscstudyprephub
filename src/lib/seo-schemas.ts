import { BRAND } from "./constants";

export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://sscstudyprephub-rpqv.vercel.app")
  );
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  const baseUrl = getSiteBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export function generateFaqSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function generateCourseSchema() {
  const baseUrl = getSiteBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Complete SSC Touch Typing Masterclass (365+ Lessons)",
    description:
      "Free interactive touch typing course designed for SSC CGL Tier-II DEST, SSC CHSL 35 WPM English & 30 WPM Hindi typing tests, RRB, and central government exams. Master all 10 fingers from scratch to advanced speed.",
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
    },
    educationalLevel: "Beginner to Advanced (0 to 50+ WPM)",
    isAccessibleForFree: true,
    inLanguage: "en-IN",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: "PT15M per day",
    },
    offers: {
      "@type": "Offer",
      category: "Free",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    syllabusSections: [
      {
        "@type": "Syllabus",
        name: "Stage 1: Home Row Foundations (Ch. 1-40)",
        description: "Posture, tactile F/J bumps, 8 base finger anchors.",
      },
      {
        "@type": "Syllabus",
        name: "Stage 2: Top Row Expansion (Ch. 41-90)",
        description: "Vowels E, I, U, O and consonants R, T, Y, W, P, Q.",
      },
      {
        "@type": "Syllabus",
        name: "Stage 3: Bottom Row Mastery (Ch. 91-145)",
        description: "Downward curls V, B, M, N, C, X, Z, comma, and period.",
      },
      {
        "@type": "Syllabus",
        name: "Stage 4: Capitalization & Shift Sync (Ch. 146-195)",
        description: "Opposite-hand Shift rules, proper nouns, and polity terms.",
      },
      {
        "@type": "Syllabus",
        name: "Stage 5: Number Row & Common Symbols (Ch. 196-250)",
        description: "Numbers 0-9, administrative punctuation, and math symbols.",
      },
      {
        "@type": "Syllabus",
        name: "Stage 6: SSC High-Frequency Vocabulary (Ch. 251-305)",
        description: "Polity, Constitution, Judiciary, and exam bigrams.",
      },
      {
        "@type": "Syllabus",
        name: "Stage 7: Paragraph Fluency & Endurance (Ch. 306-345)",
        description: "Backspace control, metronome rhythm, and speed pacing.",
      },
      {
        "@type": "Syllabus",
        name: "Stage 8: Authentic SSC CGL & CHSL DEST Simulator (Ch. 346-365+)",
        description: "15-minute 2000 keystroke exam tests with commission error formula.",
      },
    ],
  };
}

export function generateDestExamSchema() {
  const baseUrl = getSiteBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SSC CGL & CHSL DEST Typing Test Simulator",
    description:
      "Simulate official Staff Selection Commission Data Entry Skill Test (DEST) with authentic 15-minute 2000 key depressions and 10-minute 1750 key depressions, commission penalty scoring, and pass/fail evaluation.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, Windows, macOS, Android, Linux",
    url: `${baseUrl}/typing/exam`,
    browserRequirements: "Requires modern web browser with JavaScript enabled",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    creator: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
    },
  };
}
