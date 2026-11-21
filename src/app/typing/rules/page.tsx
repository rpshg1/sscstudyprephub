import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Keyboard,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";
import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  getSiteBaseUrl,
} from "@/lib/seo-schemas";

const baseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: "SSC CGL & CHSL DEST Typing Test Rules: Error Calculation & Cutoff",
  description:
    "Official SSC DEST typing test rules: 2000 keystrokes in 15 mins for CGL, 1750 in 10 mins for CHSL. Full mistakes vs half mistakes formula, backspace rules, and cutoffs.",
  keywords: [
    "ssc dest typing test rules",
    "ssc typing test error calculation formula",
    "ssc cgl dest 2000 keystrokes rules",
    "ssc chsl typing test 35 wpm english rules",
    "ssc typing full mistakes half mistakes",
    "is backspace allowed in ssc typing test",
    "ssc cgl typing qualifying cutoff percentage",
    "staff selection commission data entry skill test",
  ],
  alternates: {
    canonical: "/typing/rules",
  },
  openGraph: {
    title: "SSC CGL & CHSL DEST Typing Rules & Error Calculation Guide | SSPH",
    description:
      "Complete official guide to Staff Selection Commission Data Entry Skill Test (DEST). 2,000 keystroke rules, error calculation formula, and category-wise cutoffs.",
    url: `${baseUrl}/typing/rules`,
    type: "article",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SSC DEST Typing Rules & Error Calculation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSC CGL & CHSL DEST Typing Rules & Error Formula | SSPH",
    description:
      "Official commission error calculation formula, backspace rules, and category-wise cutoffs for SSC CGL & CHSL DEST.",
    images: [`${baseUrl}/og-image.png`],
  },
};

const RULES_FAQS = [
  {
    question: "Is backspace allowed in the official SSC DEST typing test?",
    answer:
      "Yes. In the official TCS-conducted SSC CGL and CHSL typing test, the Backspace key and Arrow keys are fully functional within the active paragraph buffer. Candidates can correct mistakes anytime before the 15-minute (or 10-minute) timer expires.",
  },
  {
    question: "How is the percentage of errors calculated in SSC DEST?",
    answer:
      "The official commission formula is: Percentage of Errors = [Total Full Mistakes + (Total Half Mistakes / 2)] / Total Number of Words in Master Text * 100. If your error percentage is within your category cutoff, you qualify.",
  },
  {
    question: "What is the permissible error limit (cutoff) for SSC CGL Tier-II DEST?",
    answer:
      "For UR (General) category candidates, the standard permissible error limit is 5%. For OBC and EWS candidates, it is 7%. For SC, ST, ESM, and PwD candidates, it is 10%.",
  },
  {
    question: "What counts as a Full Mistake in SSC evaluation?",
    answer:
      "Full mistakes (100% penalty) include: 1) Omission of any word or figure, 2) Substitution of a wrong word/figure for the correct word, 3) Addition of any word or figure not present in the master passage.",
  },
  {
    question: "What counts as a Half Mistake in SSC evaluation?",
    answer:
      "Half mistakes (50% penalty) include: 1) Spacing errors (unwanted space or missing space between words), 2) Capitalization errors (typing lowercase instead of uppercase or vice-versa), 3) Punctuation errors, 4) Minor transposition of adjacent letters within a word.",
  },
];

export default function DestRulesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Touch Typing Hub", url: "/typing" },
    { name: "DEST Rules & Error Calculation", url: "/typing/rules" },
  ]);

  const faqSchema = generateFaqSchema(RULES_FAQS);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "SSC CGL & CHSL DEST Typing Test Rules: Error Calculation, Backspace & Cutoff",
    description:
      "Complete official guide to Staff Selection Commission Data Entry Skill Test (DEST). 2,000 keystroke rules, error calculation formula, and category-wise cutoffs.",
    image: `${baseUrl}/og-image.png`,
    author: {
      "@type": "Organization",
      name: "SSCSTUDYPREPHUB Academic Review Board",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: `${baseUrl}/typing/rules`,
    datePublished: "2026-01-15T00:00:00+05:30",
    dateModified: new Date().toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {/* HEADER */}
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/typing" className="hover:text-blue-600">Typing Hub</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">DEST Rules</span>
          </nav>
          <Badge tone="blue">Official Commission Guide</Badge>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101B33] dark:text-white leading-tight">
            SSC CGL &amp; CHSL DEST Typing Test Rules: Error Calculation &amp; Cutoff
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            The Data Entry Skill Test (DEST) is a mandatory qualifying module in SSC CGL Tier-II and CHSL Tier-II. Even candidates scoring 350+ marks get disqualified if they fail the typing cutoff. Here is the complete official breakdown of keystrokes, mistake calculations, backspace rules, and qualifying criteria.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-6">
            <span>By <strong>SSPH Academic Review Board</strong></span>
            <span>•</span>
            <span>Updated Against Official SSC Guidelines (2025–2026)</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Verified Commission Criteria</span>
          </div>
        </div>

        {/* CTA HERO BANNER */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5" /> 100% Free Live Simulator
              </span>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white">
                Practice on the Exact TCS DEST Simulator
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
                Experience authentic 15-minute 2,000 keystroke exam tests with live error highlighting, mechanical sound effects, and commission pass/fail evaluation.
              </p>
            </div>
            <Link
              href="/typing/exam"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-md hover:bg-blue-50 transition-all shrink-0"
            >
              <Keyboard className="h-4 w-4" />
              Launch DEST Simulator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* SECTION 1: OFFICIAL PARAMETERS TABLE */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#101B33] dark:text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            1. Official SSC DEST Parameters: CGL vs CHSL
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            The Staff Selection Commission mandates the following minimum keystroke volume and duration:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101B33]">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Parameter</th>
                  <th className="px-5 py-3.5">SSC CGL Tier-II</th>
                  <th className="px-5 py-3.5">SSC CHSL Tier-II (LDC/JSA)</th>
                  <th className="px-5 py-3.5">SSC CHSL (DEO Post)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Total Keystrokes</td>
                  <td className="px-5 py-3 font-bold text-blue-600">2,000 Key Depressions</td>
                  <td className="px-5 py-3 font-bold text-blue-600">1,750 Key Depressions</td>
                  <td className="px-5 py-3 font-bold text-blue-600">3,750 Key Depressions</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Duration Allowed</td>
                  <td className="px-5 py-3">15 Minutes</td>
                  <td className="px-5 py-3">10 Minutes</td>
                  <td className="px-5 py-3">15 Minutes</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Nominal Speed</td>
                  <td className="px-5 py-3">~27 WPM (Words/Min)</td>
                  <td className="px-5 py-3">35 WPM (Eng) / 30 WPM (Hin)</td>
                  <td className="px-5 py-3">50 WPM (8,000 KDPH)</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Evaluation Nature</td>
                  <td className="px-5 py-3 text-amber-600 font-semibold">Qualifying Only</td>
                  <td className="px-5 py-3 text-amber-600 font-semibold">Qualifying Only</td>
                  <td className="px-5 py-3 text-amber-600 font-semibold">Qualifying Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 2: ERROR CALCULATION FORMULA */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#101B33] dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            2. The Official Commission Error Formula
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The commission does not simply count mistakes; it weights them into Full Mistakes and Half Mistakes. The official formula evaluated by the computer software is:
          </p>

          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-5 dark:border-blue-900 dark:bg-blue-950/40 text-center sm:text-left">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Official SSC Formula</p>
            <p className="text-base sm:text-lg font-mono font-bold text-[#101B33] dark:text-white">
              Error Percentage (%) = [Full Mistakes + (Half Mistakes / 2)] ÷ Total Words in Passage × 100
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Card className="p-5 border-red-200 bg-red-50/30 dark:bg-red-950/20">
              <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 text-base">
                <ShieldAlert className="h-5 w-5" />
                Full Mistakes (100% Penalty)
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                <li><strong>Omission of a word:</strong> Skipping any word or number present in the master passage.</li>
                <li><strong>Substitution of a word:</strong> Typing a different word instead of the correct word (e.g., typing <em>"there"</em> instead of <em>"their"</em>).</li>
                <li><strong>Addition of a word:</strong> Typing any word or figure not present in the master text.</li>
              </ul>
            </Card>

            <Card className="p-5 border-amber-200 bg-amber-50/30 dark:bg-amber-950/20">
              <h3 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 text-base">
                <HelpCircle className="h-5 w-5" />
                Half Mistakes (50% Penalty)
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                <li><strong>Spacing Error:</strong> Missing space between words (e.g., <em>"infront"</em> instead of <em>"in front"</em>) or extra space inside a word.</li>
                <li><strong>Capitalization Error:</strong> Typing uppercase instead of lowercase, or vice-versa (e.g., <em>"india"</em> instead of <em>"India"</em>).</li>
                <li><strong>Punctuation Error:</strong> Missing or wrongly typed full stop (.), comma (,), semicolon (;), etc.</li>
                <li><strong>Transposition:</strong> Inverting adjacent characters within a word (e.g., typing <em>"recieve"</em> instead of <em>"receive"</em>).</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* SECTION 3: CUTOFF PERCENTAGES */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#101B33] dark:text-white">
            3. Category-Wise Permissible Error Cutoffs
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            To qualify, your total calculated error percentage must be strictly equal to or lower than your category benchmark:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#101B33]">
              <span className="text-xs text-slate-500 font-medium">UR (General)</span>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">5%</p>
              <span className="text-[11px] text-slate-400">Max permissible error</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#101B33]">
              <span className="text-xs text-slate-500 font-medium">OBC / EWS</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">7%</p>
              <span className="text-[11px] text-slate-400">Max permissible error</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#101B33]">
              <span className="text-xs text-slate-500 font-medium">SC / ST</span>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">10%</p>
              <span className="text-[11px] text-slate-400">Max permissible error</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#101B33]">
              <span className="text-xs text-slate-500 font-medium">ESM / PwD</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">10%</p>
              <span className="text-[11px] text-slate-400">Max permissible error</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: THE BACKSPACE QUESTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#101B33] dark:text-white">
            4. Is Backspace Allowed in the Official SSC Exam?
          </h2>
          <Card className="p-6 space-y-3 bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
              <CheckCircle2 className="h-5 w-5" />
              YES — Backspace and Arrow Keys are 100% Permitted
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Contrary to common rumors on Telegram study channels, <strong>the Backspace key is NOT disabled</strong> during the official TCS-conducted SSC CGL and CHSL typing test. Candidates can freely use Backspace, Delete, and Left/Right Arrow keys to navigate within their typed passage and correct mistakes before submitting.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 italic">
              <strong>Tip from Toppers:</strong> While backspace is permitted, excessive backspacing destroys your cadence. Practice typing in rhythm on our <Link href="/typing" className="text-blue-600 underline font-semibold">365-Day Touch Typing Course</Link> to reduce correction habits.
            </p>
          </Card>
        </section>

        {/* SECTION 5: FAQS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#101B33] dark:text-white">
            Frequently Asked Questions (DEST)
          </h2>
          <div className="space-y-3">
            {RULES_FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-slate-200 bg-white p-5 open:border-blue-500 dark:border-slate-800 dark:bg-[#101B33]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#101B33] dark:text-white">
                  <span>{faq.question}</span>
                  <span className="text-blue-600 text-lg font-normal group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* FOOTER ACTION */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/typing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Explore 365 Touch Typing Chapters
          </Link>
          <Link
            href="/typing/exam"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            Start DEST Practice Exam
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
