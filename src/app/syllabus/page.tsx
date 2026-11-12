import type { Metadata } from "next";
import { Card } from "@/components/ui/primitives";
import { ensureSyllabusCategory } from "@/lib/resources";
import { ResourceCatalogSection } from "@/components/resource-catalog-section";

export const metadata: Metadata = {
  title: "SSC Exam Syllabus 2026 — CGL, CHSL, MTS, CPO & GD Pattern + PDFs",
  description:
    "Complete Staff Selection Commission (SSC) Tier-I & Tier-II syllabus breakdown and free downloadable syllabus PDFs for SSC CGL, CHSL, MTS, CPO, and GD.",
  alternates: { canonical: "/syllabus" },
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

export default async function SyllabusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await ensureSyllabusCategory().catch(() => {});
  const sp = await searchParams;

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
  );
}
