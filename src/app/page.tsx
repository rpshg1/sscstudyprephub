import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  History,
  Keyboard,
  Newspaper,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { listPublicResources } from "@/lib/resources";
import { BRAND, EXAM_OPTIONS, HOME_FAQS, SOCIAL_LINKS } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";
import { SearchBar } from "@/components/search-bar";
import { ResourceCard } from "@/components/resource-card";
import { TelegramIcon, InstagramIcon, YouTubeIcon } from "@/components/social-icons";

export const revalidate = 60;

const QUICK_CATEGORIES = [
  {
    title: "Preparation Books",
    description: "Structured textbooks & subject compendiums",
    href: "/books",
    icon: BookOpen,
  },
  {
    title: "Study Notes",
    description: "Chapter-wise formulas & quick revision PDFs",
    href: "/books?category=study-notes",
    icon: FileText,
  },
  {
    title: "Previous Year Questions",
    description: "Solved shift papers & practice compilations",
    href: "/pyqs",
    icon: History,
  },
  {
    title: "Exam Syllabus",
    description: "Tier-I & Tier-II pattern + downloadable syllabus PDFs",
    href: "/syllabus",
    icon: Newspaper,
  },
] as const;

export default async function HomePage() {
  const [popularResources, latestResources, totalResourcesCount] =
    await Promise.all([
      listPublicResources({
        sort: "popular",
        excludeTypes: ["ROADMAP"],
        take: 4,
      }),
      listPublicResources({
        sort: "newest",
        excludeTypes: ["ROADMAP"],
        take: 4,
      }),
      prisma.resource.count({
        where: { isPublished: true, resourceType: { not: "ROADMAP" } },
      }),
    ]);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://sscstudyprephub-rpqv.vercel.app";

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: BRAND.name,
      alternateName: BRAND.shortName,
      description: BRAND.heroSubtitle,
      url: baseUrl,
      email: BRAND.supportEmail,
      sameAs: [BRAND.telegramUrl, BRAND.instagramUrl, BRAND.youtubeUrl],
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      image: `${baseUrl}/og-image.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND.name,
      alternateName: [BRAND.shortName, "SSC Study Prep Hub", "sscstudyprephub-rpqv.vercel.app"],
      url: `${baseUrl}/`,
      publisher: {
        "@type": "Organization",
        name: BRAND.name,
        url: `${baseUrl}/`,
        sameAs: [BRAND.telegramUrl, BRAND.instagramUrl, BRAND.youtubeUrl],
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
          width: 512,
          height: 512,
        },
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/books?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOME_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* HERO SECTION */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#2563EB]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{BRAND.tagline}</span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#101B33] sm:text-5xl">
              {BRAND.heroHeading}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {BRAND.heroSubtitle}
            </p>

            <div className="mt-8">
              <SearchBar
                placeholder="Search books, notes and PYQs..."
                className="mx-auto max-w-2xl"
              />
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/books"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
              >
                Explore Books
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pyqs"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#101B33] px-6 text-sm font-semibold text-white hover:bg-[#1B2B4F] transition-colors"
              >
                Previous Year Papers (PYQs)
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {totalResourcesCount}+ Curated SSC Study PDFs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                100% Free &amp; Ad-Supported Library
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#101B33]" />
                CGL • CHSL • MTS • CPO • GD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#101B33]">
              Browse by Resource Format
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Jump directly to books, concise notes, PYQs, or current affairs.
            </p>
          </div>
          <Link
            href="/books"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Browse all books
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.title} href={cat.href} className="group">
                <Card className="h-full p-5 transition-all group-hover:border-[#2563EB] group-hover:shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#101B33]">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {cat.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TYPING SECTION CALLOUT */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 p-6 sm:p-8 text-white shadow-md dark:border-blue-900">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5" /> New: 365+ Interactive Typing Chapters
              </span>
              <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-white">
                Learn Touch Typing from Scratch for SSC CGL &amp; CHSL DEST
              </h3>
              <p className="mt-1.5 text-sm text-blue-100 leading-relaxed">
                Master 10-finger typing with our interactive virtual keyboard, hand-placement guides, and official 2000-keystroke commission exam simulator. 100% free with step-by-step tutorials.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/typing"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50 transition-all active:scale-95"
              >
                <Keyboard className="h-4 w-4" /> Start Typing (Free)
              </Link>
              <Link
                href="/typing/exam"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition-all"
              >
                DEST Simulator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR RESOURCES */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Badge tone="blue">Student Favorites</Badge>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#101B33]">
              Popular Resources
            </h2>
          </div>
          <Link
            href="/books?sort=popular"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            See all popular
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* SSC EXAMINATION CATEGORIES */}
      <section className="border-y border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[#101B33]">
              Target Your SSC Examination
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Filter notes, books, and PYQ compilations organized for each Staff
              Selection Commission examination tier.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {EXAM_OPTIONS.filter((e) => e.value !== "ALL_SSC").map((exam) => (
              <Link
                key={exam.value}
                href={`/books?exam=${exam.value}`}
                className="group rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 hover:border-[#2563EB] hover:bg-white transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#101B33]">
                    {exam.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                </div>
                <p className="mt-1.5 text-xs text-slate-600">{exam.fullName}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SSC PREPARATION SUBJECT PILLARS & TOPICAL SEO */}
      <section className="bg-slate-50/70 border-b border-[#E2E8F0] dark:bg-slate-900/40 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge tone="blue">Complete Tier-I &amp; Tier-II Syllabus Coverage</Badge>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B33] dark:text-white">
              Subject-Wise Study Resources &amp; Exam Pillars
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every Staff Selection Commission exam tier demands precision across 5 core sections. Access chapter-wise notes, solved MCQs, formula books, and practice tests designed for high retention.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold">
                  QA
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Quantitative Aptitude</h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Arithmetic &amp; Advance Maths</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Percentages, Profit &amp; Loss, SI/CI, Time &amp; Work, Ratio, Mixture, along with Advance Geometry, Trigonometry, Algebra, Mensuration 2D/3D, and Coordinate Geometry.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link href="/books?subject=Quantitative+Aptitude" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  Maths Books &amp; Formulas &rarr;
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold">
                  ENG
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">English Comprehension</h3>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Grammar &amp; Vocabulary</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                120 Rules of Grammar, One-Word Substitutions, Idioms &amp; Phrases, Synonyms/Antonyms, Cloze Test, Active/Passive Voice, Direct/Indirect Speech, and Reading Comprehension.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link href="/books?subject=English" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  English Vocabulary &amp; Grammar &rarr;
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 font-bold">
                  REAS
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Reasoning &amp; Intelligence</h3>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Verbal &amp; Non-Verbal Logic</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Syllogisms, Coding-Decoding, Blood Relations, Direction Sense, Seating Arrangement, Analogies, Number Series, Paper Folding, and Venn Diagrams.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link href="/books?subject=Reasoning" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                  Reasoning Practice Sets &rarr;
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 font-bold">
                  GA
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">General Awareness</h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Static GK &amp; Current Affairs</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Indian Polity &amp; Constitution, Modern &amp; Ancient History, Physical &amp; Indian Geography, Economics, Five-Year Plans, Union Budget, and General Science (NCERT summary).
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link href="/books?subject=General+Awareness" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                  GK &amp; Static Notes &rarr;
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 font-bold">
                  DEST
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Touch Typing &amp; DEST</h3>
                  <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">Tier-II Qualifying Simulator</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                365-chapter progressive touch typing course with 8 hand-placement stages, tactile bump guides, and 2,000 keystroke 15-minute SSC CGL / CHSL DEST exam simulations.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link href="/typing" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">
                  Start Typing Course (Free) &rarr;
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 font-bold">
                  PYQ
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Solved PYQ Papers</h3>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">TCS Shift-Wise Solutions</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Authentic TCS-conducted exam shifts for SSC CGL, CHSL, MTS, CPO, and GD with verified commission answer keys and detailed mathematical step-by-step solutions.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link href="/pyqs" className="text-rose-600 dark:text-rose-400 font-bold hover:underline">
                  Browse Solved Papers &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST UPLOADS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Badge tone="slate">Recently Added</Badge>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#101B33]">
              Latest Uploads
            </h2>
          </div>
          <Link
            href="/books?sort=newest"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Browse newest
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latestResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* ASPIRANT COMMUNITY & SOCIALS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-purple-50/40 p-6 sm:p-10 dark:border-slate-800 dark:from-[#0F172A] dark:via-[#131F37] dark:to-[#0F172A]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge tone="blue">Aspirant Community</Badge>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B33] dark:text-white">
                Join Us On Telegram, Instagram &amp; YouTube
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Connect with {BRAND.socialHandle} across all platforms for daily study PDFs, instant alerts, short tricks, and video tutorials.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950/60 px-3 py-1.5 rounded-full self-start sm:self-auto">
              Official: {BRAND.socialHandle}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Telegram Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-sky-200 bg-white p-6 shadow-xs transition-all hover:shadow-md hover:border-sky-400 dark:border-sky-900/60 dark:bg-[#101B33]">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-[#229ED9] dark:bg-sky-950 dark:text-sky-300">
                    <TelegramIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                    Channel
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#101B33] dark:text-white">
                  Telegram Channel
                </h3>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                  @sscstudyprephub
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  Instant alerts for new books, direct PDF drops, question compilations, and shift-wise answer keys without waiting.
                </p>
              </div>
              <a
                href={BRAND.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#1E8BBF] transition-colors"
              >
                <TelegramIcon className="h-4 w-4" />
                Join Telegram Channel
              </a>
            </div>

            {/* Instagram Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-rose-200 bg-white p-6 shadow-xs transition-all hover:shadow-md hover:border-rose-400 dark:border-rose-900/60 dark:bg-[#101B33]">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-[#E1306C] dark:bg-rose-950 dark:text-rose-300">
                    <InstagramIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                    Daily Reels
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#101B33] dark:text-white">
                  Instagram Page
                </h3>
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                  @sscstudyprephub
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  Daily static GK mnemonics, English vocabulary flashcards, exam notifications, and motivational tips in quick 30s reels.
                </p>
              </div>
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E1306C] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#C8235C] transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
                Follow @sscstudyprephub
              </a>
            </div>

            {/* YouTube Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-red-200 bg-white p-6 shadow-xs transition-all hover:shadow-md hover:border-red-400 dark:border-red-900/60 dark:bg-[#101B33]">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-[#FF0000] dark:bg-red-950 dark:text-red-300">
                    <YouTubeIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/80 dark:text-red-300">
                    Videos
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#101B33] dark:text-white">
                  YouTube Channel
                </h3>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-0.5">
                  @sscstudyprephub
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  Touch typing tutorials, 15-minute SSC DEST exam demonstrations, subject roadmaps, and paper analysis video guides.
                </p>
              </div>
              <a
                href={BRAND.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF0000] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#CC0000] transition-colors"
              >
                <YouTubeIcon className="h-4 w-4" />
                Subscribe on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-[#101B33]">
            Frequently Asked Questions
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Clear answers on free access, ad-supported downloads, and content policy.
          </p>
        </div>

        <div className="space-y-3">
          {HOME_FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-[#E2E8F0] bg-white p-5 open:border-[#2563EB]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#101B33]">
                <span>{faq.question}</span>
                <span className="text-[#2563EB] text-lg font-normal group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
