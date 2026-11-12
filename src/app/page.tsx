import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  History,
  Map,
  Newspaper,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { listPublicResources } from "@/lib/resources";
import { BRAND, EXAM_OPTIONS, HOME_FAQS } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";
import { SearchBar } from "@/components/search-bar";
import { ResourceCard } from "@/components/resource-card";

export const revalidate = 60;

const QUICK_CATEGORIES = [
  {
    title: "Preparation Books",
    description: "Structured textbooks & subject compendiums",
    href: "/library?type=BOOK",
    icon: BookOpen,
  },
  {
    title: "Study Notes",
    description: "Chapter-wise formulas & quick revision PDFs",
    href: "/library?type=NOTES",
    icon: FileText,
  },
  {
    title: "Previous Year Questions",
    description: "Solved shift papers & practice compilations",
    href: "/library?type=PYQ",
    icon: History,
  },
  {
    title: "Study Roadmaps",
    description: "Week-by-week planners for Tier-I & Tier-II",
    href: "/library?type=ROADMAP",
    icon: Map,
  },
  {
    title: "Current Affairs",
    description: "Monthly exam digests & policy updates",
    href: "/library?type=CURRENT_AFFAIRS",
    icon: Newspaper,
  },
] as const;

export default async function HomePage() {
  const [popularResources, latestResources, totalResourcesCount] =
    await Promise.all([
      listPublicResources({ sort: "popular", take: 4 }),
      listPublicResources({ sort: "newest", take: 4 }),
      prisma.resource.count({ where: { isPublished: true } }),
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
      alternateName: BRAND.shortName,
      url: baseUrl,
      publisher: {
        "@type": "Organization",
        name: BRAND.name,
        url: baseUrl,
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
          urlTemplate: `${baseUrl}/library?q={search_term_string}`,
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
                placeholder="Search books, notes, PYQs and roadmaps..."
                className="mx-auto max-w-2xl"
              />
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/library"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
              >
                Explore Resources
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/library?type=PYQ"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#101B33] px-6 text-sm font-semibold text-white hover:bg-[#1B2B4F] transition-colors"
              >
                Browse Previous Year Papers
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
              Jump directly to books, concise notes, PYQs, study roadmaps, or current affairs.
            </p>
          </div>
          <Link
            href="/library"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            View all 16 subject categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            href="/library?sort=popular"
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
              Filter notes, PYQ compilations, and 12-week roadmaps organized for each
              Staff Selection Commission examination tier.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {EXAM_OPTIONS.filter((e) => e.value !== "ALL_SSC").map((exam) => (
              <Link
                key={exam.value}
                href={`/library?exam=${exam.value}`}
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
            href="/library?sort=newest"
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
