import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTypingChapter } from "@/lib/typing/curriculum";
import { TypingRunner } from "@/components/typing/typing-runner";
import { generateBreadcrumbSchema, getSiteBaseUrl } from "@/lib/seo-schemas";
import { BRAND } from "@/lib/constants";

interface ChapterPageProps {
  params: Promise<{
    chapterId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { chapterId } = await params;
  const id = parseInt(chapterId, 10);
  if (isNaN(id)) return { title: "Typing Practice | SSPH" };

  const chapter = getTypingChapter(id);
  if (!chapter) return { title: "Chapter Not Found | SSPH" };

  const baseUrl = getSiteBaseUrl();
  const canonicalUrl = `/typing/${chapter.id}`;

  return {
    title: `Chapter ${chapter.id}: ${chapter.title} — Stage ${chapter.stageNumber} | SSPH Touch Typing`,
    description: chapter.description,
    keywords: [
      `touch typing chapter ${chapter.id}`,
      `stage ${chapter.stageNumber} typing practice`,
      chapter.title,
      ...chapter.newKeys.map((k) => `key ${k === " " ? "space" : k} typing drill`),
      "SSC CGL DEST typing drill",
      "free online touch typing practice",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Chapter ${chapter.id}: ${chapter.title} | SSPH Touch Typing`,
      description: chapter.description,
      url: `${baseUrl}${canonicalUrl}`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Chapter ${chapter.id}: ${chapter.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Chapter ${chapter.id}: ${chapter.title} | SSPH`,
      description: chapter.description,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export function generateStaticParams() {
  // Pre-render the core initial chapters for lightning-fast edge delivery
  return Array.from({ length: 45 }, (_, i) => ({
    chapterId: (i + 1).toString(),
  }));
}

export default async function ChapterPracticePage({ params }: ChapterPageProps) {
  const { chapterId } = await params;
  const id = parseInt(chapterId, 10);

  if (isNaN(id) || id < 1 || id > 365) {
    notFound();
  }

  const chapter = getTypingChapter(id);
  if (!chapter) {
    notFound();
  }

  const baseUrl = getSiteBaseUrl();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Touch Typing Course", url: "/typing" },
    { name: `Stage ${chapter.stageNumber}: ${chapter.stageTitle}`, url: "/typing" },
    { name: `Chapter ${chapter.id}: ${chapter.title}`, url: `/typing/${chapter.id}` },
  ]);

  const learningResourceSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `Chapter ${chapter.id}: ${chapter.title}`,
    description: chapter.description,
    educationalLevel: "Touch Typing Skill Mastery",
    learningResourceType: "Interactive Practice Drill",
    isAccessibleForFree: true,
    inLanguage: "en-IN",
    url: `${baseUrl}/typing/${chapter.id}`,
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
    },
  };

  const schemas = [breadcrumbSchema, learningResourceSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-6 dark:bg-[#070D18]">
        <TypingRunner chapter={chapter} />
      </div>
    </>
  );
}
