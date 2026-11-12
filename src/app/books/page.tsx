import type { Metadata } from "next";
import { ResourceCatalogSection } from "@/components/resource-catalog-section";

export const metadata: Metadata = {
  title: "SSC Books — Preparation Books & Reference PDFs",
  description:
    "Browse curated SSC CGL, CHSL, MTS, CPO, and GD preparation books, topic guides, and subject compendiums across Mathematics, English, Reasoning, and GK.",
  alternates: { canonical: "/books" },
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return (
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
  );
}
