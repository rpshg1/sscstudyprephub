import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTypingChapter } from "@/lib/typing/curriculum";
import { TypingRunner } from "@/components/typing/typing-runner";

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

  return {
    title: `Chapter ${chapter.id}: ${chapter.title} | SSC Touch Typing Course`,
    description: chapter.description,
  };
}

export function generateStaticParams() {
  // Pre-render the core initial chapters for fast loading
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-6 dark:bg-[#070D18]">
      <TypingRunner chapter={chapter} />
    </div>
  );
}
