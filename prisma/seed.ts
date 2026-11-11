import path from "path";
import { PrismaClient } from "@prisma/client";
import { REQUIRED_CATEGORIES, formatExamLabel } from "../src/lib/constants";
import { writeSamplePdfFile, type SamplePdfSpec } from "../src/lib/pdf-generator";
import { inspectAndCreateSamplePdf } from "../src/lib/pdf-sample";
import { hashPassword } from "../src/lib/crypto";

const prisma = new PrismaClient();

interface SeedResourceDef {
  slug: string;
  title: string;
  description: string;
  examCategory: "SSC_CGL" | "SSC_CHSL" | "SSC_MTS" | "SSC_CPO" | "SSC_GD" | "ALL_SSC";
  resourceType: "BOOK" | "NOTES" | "PYQ" | "ROADMAP" | "CURRENT_AFFAIRS" | "PRACTICE_SET";
  subject: string;
  categorySlug: string;
  accessType: "FREE" | "AD_SUPPORTED" | "PREMIUM";
  coverAccent: string;
  pageCount: number;
  isFeatured: boolean;
  downloadCount: number;
  authorSource: string;
  pdfSpec: SamplePdfSpec;
}

const SAMPLE_RESOURCES: SeedResourceDef[] = [
  {
    slug: "ssc-cgl-mathematics-notes-demo",
    title: "SSC CGL Mathematics Notes (Arithmetic & Advanced)",
    description:
      "DEMO resource: High-yield formula sheets and shortcut methods covering Percentage, Profit & Loss, Ratio, Trigonometry, Geometry, and Algebra tailored for SSC CGL Tier-I & Tier-II.",
    examCategory: "SSC_CGL",
    resourceType: "NOTES",
    subject: "Mathematics",
    categorySlug: "mathematics",
    accessType: "AD_SUPPORTED",
    coverAccent: "#2563EB",
    pageCount: 64,
    isFeatured: true,
    downloadCount: 1420,
    authorSource: "SSPH Quantitative Faculty (DEMO)",
    pdfSpec: {
      title: "SSC CGL Mathematics Notes - Arithmetic & Advanced Formula Digest",
      exam: "SSC CGL Tier-I & Tier-II",
      subject: "Mathematics",
      authorSource: "SSPH Quantitative Faculty (DEMO)",
      summary:
        "DEMO sample compilation of essential quantitative aptitude identities, ratio tricks, and geometry theorems commonly tested in SSC CGL examinations.",
      sections: [
        {
          heading: "1. Arithmetic Core Identities",
          bullets: [
            "Successive percentage change of a% and b%: Net % = a + b + (ab / 100).",
            "Compound Interest for 2 years at R%: Effective rate = 2R + (R^2 / 100)%.",
            "Time & Work efficiency: Work = Efficiency x Time; if A is k times faster, time ratio is 1:k.",
            "Mixture Alligation: Quantity ratio = (Dearer - Mean) : (Mean - Cheaper).",
          ],
        },
        {
          heading: "2. Geometry & Trigonometry Quick Check",
          bullets: [
            "Sum of interior angles of an n-sided polygon = (n - 2) x 180 degrees.",
            "In any triangle, angle bisector divides opposite side in ratio of adjacent sides.",
            "sec^2(theta) - tan^2(theta) = 1; therefore sec(theta) + tan(theta) = 1 / (sec - tan).",
            "Cyclic quadrilateral opposite angles always sum to 180 degrees.",
          ],
        },
      ],
    },
  },
  {
    slug: "ssc-english-grammar-notes-demo",
    title: "SSC English Grammar Notes & Error Spotting Rules",
    description:
      "DEMO resource: Concise grammar rules covering Subject-Verb Agreement, Tenses, Prepositions, Active/Passive Voice, Direct/Indirect Narration, and high-frequency idioms.",
    examCategory: "ALL_SSC",
    resourceType: "NOTES",
    subject: "English",
    categorySlug: "english",
    accessType: "FREE",
    coverAccent: "#1D4ED8",
    pageCount: 48,
    isFeatured: true,
    downloadCount: 1890,
    authorSource: "SSPH English Editorial (DEMO)",
    pdfSpec: {
      title: "SSC English Grammar Notes & Error Spotting Rules",
      exam: "SSC CGL / CHSL / CPO / MTS",
      subject: "English",
      authorSource: "SSPH English Editorial (DEMO)",
      summary:
        "DEMO reference sheet summarizing the most frequently examined English grammar patterns, voice conversions, and sentence improvement checkpoints.",
      sections: [
        {
          heading: "1. Subject-Verb Agreement Essentials",
          bullets: [
            "Each, Every, Either, Neither take a singular verb even with plural noun after 'of'.",
            "With 'as well as', 'along with', and 'together with', verb agrees with first subject.",
            "'A number of' takes a plural verb; 'The number of' takes a singular verb.",
          ],
        },
        {
          heading: "2. Conditionals & Tenses",
          bullets: [
            "Zero conditional: If + Simple Present, Simple Present (universal truths).",
            "Second conditional: If + Simple Past (were), would + V1 (hypothetical).",
            "Third conditional: If + had + V3, would have + V3 (past unfulfilled).",
          ],
        },
      ],
    },
  },
  {
    slug: "reasoning-practice-set-demo",
    title: "Reasoning Practice Set (Tier-I & Tier-II Mixed)",
    description:
      "DEMO resource: Structured General Intelligence & Reasoning practice problems featuring Analogy, Coding-Decoding, Syllogism, Number Series, and Seating Arrangement.",
    examCategory: "SSC_CGL",
    resourceType: "PRACTICE_SET",
    subject: "Reasoning",
    categorySlug: "reasoning",
    accessType: "AD_SUPPORTED",
    coverAccent: "#0F172A",
    pageCount: 38,
    isFeatured: true,
    downloadCount: 1120,
    authorSource: "SSPH Reasoning Desk (DEMO)",
    pdfSpec: {
      title: "General Intelligence & Reasoning Practice Set",
      exam: "SSC CGL / CHSL",
      subject: "Reasoning",
      authorSource: "SSPH Reasoning Desk (DEMO)",
      summary:
        "DEMO practice drill designed to improve pattern recognition speed under timed 60-minute SSC Tier-I conditions.",
      sections: [
        {
          heading: "1. Number Series & Analogy Drills",
          bullets: [
            "Q1: Find missing term: 7, 15, 31, 63, 127, ? -> Pattern (x2 + 1) => 255.",
            "Q2: 12 : 144 :: 15 : ? -> Pattern n^2 => 225.",
            "Q3: Opposite letter pairs sum to 27 (A=1, Z=26; E=5, V=22).",
          ],
        },
        {
          heading: "2. Syllogism & Coding Strategy",
          bullets: [
            "Draw minimal overlapping Venn diagrams before evaluating 'Possibility' conclusions.",
            "Check letter shifts (+1/-1, reverse alphabet, vowel-consonant swaps) first.",
          ],
        },
      ],
    },
  },
  {
    slug: "indian-polity-notes-demo",
    title: "Indian Polity Notes (Constitution & Key Articles)",
    description:
      "DEMO resource: Exam-oriented notes on Constitutional Framework, Fundamental Rights, Directive Principles, Parliament, Supreme Court, and Constitutional Amendments.",
    examCategory: "ALL_SSC",
    resourceType: "NOTES",
    subject: "Indian Polity",
    categorySlug: "indian-polity",
    accessType: "FREE",
    coverAccent: "#1E3A8A",
    pageCount: 52,
    isFeatured: true,
    downloadCount: 1650,
    authorSource: "SSPH GS Research (DEMO)",
    pdfSpec: {
      title: "Indian Polity Notes - Constitution & Key Articles",
      exam: "All SSC Examinations",
      subject: "Indian Polity",
      authorSource: "SSPH GS Research (DEMO)",
      summary:
        "DEMO revision guide organizing Articles 1 to 395, Schedules 1 to 12, and landmark Constitutional Amendment Acts for rapid recall.",
      sections: [
        {
          heading: "1. Fundamental Rights (Part III, Articles 12-35)",
          bullets: [
            "Right to Equality (Art. 14-18): Abolition of untouchability (Art. 17) and titles (Art. 18).",
            "Right to Freedom (Art. 19-22): Protection of life and personal liberty (Art. 21).",
            "Right to Constitutional Remedies (Art. 32): 5 Writs - Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto.",
          ],
        },
        {
          heading: "2. High-Frequency Amendments",
          bullets: [
            "42nd Amendment (1976): Added Socialist, Secular, Integrity and Fundamental Duties (Part IVA).",
            "44th Amendment (1978): Moved Right to Property to Article 300A (legal right).",
            "73rd & 74th Amendments (1992): Panchayati Raj and Urban Local Bodies.",
          ],
        },
      ],
    },
  },
  {
    slug: "indian-history-revision-notes-demo",
    title: "Indian History Revision Notes (Ancient to Modern)",
    description:
      "DEMO resource: Chronological timeline of Indus Valley Civilization, Mauryan & Gupta Empires, Delhi Sultanate, Mughal Administration, and the Indian Freedom Struggle.",
    examCategory: "SSC_CGL",
    resourceType: "NOTES",
    subject: "History",
    categorySlug: "history",
    accessType: "AD_SUPPORTED",
    coverAccent: "#334155",
    pageCount: 58,
    isFeatured: false,
    downloadCount: 980,
    authorSource: "SSPH GS Research (DEMO)",
    pdfSpec: {
      title: "Indian History Revision Notes (Ancient, Medieval & Modern)",
      exam: "SSC CGL / CHSL / CPO",
      subject: "History",
      authorSource: "SSPH GS Research (DEMO)",
      summary:
        "DEMO chronological summary covering dynasties, battles, travelers, socio-religious movements, and INC sessions.",
      sections: [
        {
          heading: "1. Ancient & Medieval Milestones",
          bullets: [
            "Indus Valley sites: Harappa (Ravi), Mohenjo-daro (Indus), Lothal (Dockyard).",
            "Buddhist Councils: Rajgriha (1st), Vaishali (2nd), Pataliputra (3rd), Kundalvana (4th).",
            "Important Battles: Tarain (1191, 1192), Panipat (1526, 1556, 1761), Plassey (1757).",
          ],
        },
        {
          heading: "2. Modern Indian National Movement",
          bullets: [
            "1885: Indian National Congress founded; first session at Bombay under W.C. Bonnerjee.",
            "1905: Partition of Bengal & Swadeshi Movement.",
            "1930: Dandi March & Civil Disobedience; 1942: Quit India Movement.",
          ],
        },
      ],
    },
  },
  {
    slug: "geography-study-notes-demo",
    title: "Geography Study Notes (India & World Physical)",
    description:
      "DEMO resource: Crisp notes on Himalayan & Peninsular river systems, mountain passes, monsoon dynamics, soils, national parks, and solar system facts.",
    examCategory: "SSC_CPO",
    resourceType: "NOTES",
    subject: "Geography",
    categorySlug: "geography",
    accessType: "AD_SUPPORTED",
    coverAccent: "#0369A1",
    pageCount: 44,
    isFeatured: false,
    downloadCount: 840,
    authorSource: "SSPH GS Research (DEMO)",
    pdfSpec: {
      title: "Geography Study Notes - Indian & Physical Geography",
      exam: "SSC CPO / CGL / GD",
      subject: "Geography",
      authorSource: "SSPH GS Research (DEMO)",
      summary:
        "DEMO geographical digest mapping Indian drainage basins, passes, biosphere reserves, and atmospheric layers.",
      sections: [
        {
          heading: "1. Indian River Systems",
          bullets: [
            "Himalayan Rivers: Indus (Jhelum, Chenab, Ravi, Beas, Sutlej), Ganga, Brahmaputra.",
            "West-flowing Peninsular rivers forming estuaries: Narmada and Tapi.",
            "East-flowing Peninsular rivers forming deltas: Godavari, Krishna, Kaveri, Mahanadi.",
          ],
        },
        {
          heading: "2. Passes & Atmosphere Layers",
          bullets: [
            "Zoji La (Ladakh), Banihal (J&K), Shipki La (Himachal), Nathu La (Sikkim).",
            "Atmosphere order: Troposphere -> Stratosphere (Ozone) -> Mesosphere -> Thermosphere -> Exosphere.",
          ],
        },
      ],
    },
  },
  {
    slug: "general-science-notes-demo",
    title: "General Science Notes (Physics, Chemistry & Biology)",
    description:
      "DEMO resource: NCERT Class 6-10 aligned study notes covering SI units, optics, periodic trends, acids & bases, human physiology, vitamins, and diseases.",
    examCategory: "SSC_MTS",
    resourceType: "NOTES",
    subject: "General Science",
    categorySlug: "general-science",
    accessType: "FREE",
    coverAccent: "#2563EB",
    pageCount: 60,
    isFeatured: true,
    downloadCount: 1510,
    authorSource: "SSPH Science Team (DEMO)",
    pdfSpec: {
      title: "General Science Notes - Physics, Chemistry & Biology",
      exam: "SSC MTS / CHSL / CGL / GD",
      subject: "General Science",
      authorSource: "SSPH Science Team (DEMO)",
      summary:
        "DEMO science digest covering high-probability factual topics from NCERT standards.",
      sections: [
        {
          heading: "1. Physics & Chemistry Key Facts",
          bullets: [
            "SI Units: Force (Newton), Pressure (Pascal), Resistance (Ohm), Power (Watt).",
            "pH Scale: Below 7 acidic (HCl, Vinegar), 7 neutral (Pure water), above 7 basic (NaOH).",
            "Alloys: Brass (Cu+Zn), Bronze (Cu+Sn), Solder (Pb+Sn), Stainless Steel (Fe+Cr+Ni).",
          ],
        },
        {
          heading: "2. Biology & Vitamins",
          bullets: [
            "Fat-soluble vitamins: A, D, E, K; Water-soluble vitamins: B-complex and C.",
            "Cell organelles: Mitochondria (ATP powerhouse), Ribosome (protein synthesis).",
          ],
        },
      ],
    },
  },
  {
    slug: "ssc-chsl-preparation-roadmap-demo",
    title: "SSC CHSL Preparation Roadmap (12-Week Study Plan)",
    description:
      "DEMO resource: Complete Tier-I & Tier-II syllabus breakdown, weekly hour allocation, mock-test analysis framework, and typing test readiness checklist for SSC CHSL.",
    examCategory: "SSC_CHSL",
    resourceType: "ROADMAP",
    subject: "Study Roadmaps",
    categorySlug: "study-roadmaps",
    accessType: "FREE",
    coverAccent: "#101B33",
    pageCount: 18,
    isFeatured: true,
    downloadCount: 1340,
    authorSource: "SSPH Mentorship Desk (DEMO)",
    pdfSpec: {
      title: "SSC CHSL 12-Week Preparation Roadmap & Strategy",
      exam: "SSC CHSL Tier-I & Tier-II",
      subject: "Study Roadmaps",
      authorSource: "SSPH Mentorship Desk (DEMO)",
      summary:
        "DEMO structured study schedule guiding aspirants from syllabus foundation to full-length mock optimization and skill/typing test practice.",
      sections: [
        {
          heading: "1. Phase-Wise 12-Week Execution",
          bullets: [
            "Weeks 1-4: Core concept completion across Quant, English Grammar, and Reasoning basics.",
            "Weeks 5-8: Topic-wise Previous Year Question drills (last 5 years shifts) + static GK.",
            "Weeks 9-12: Alternate-day full mocks, error notebook review, and daily 20-min typing drill.",
          ],
        },
        {
          heading: "2. Daily Routine Blueprint (6 Hours)",
          bullets: [
            "2h Quantitative Practice | 1.5h English Vocab + Grammar | 1h Reasoning | 1.5h GS + Revision.",
          ],
        },
      ],
    },
  },
  {
    slug: "ssc-cgl-preparation-roadmap-demo",
    title: "SSC CGL Preparation Roadmap (Tier-I to Tier-II Mastery)",
    description:
      "DEMO resource: Step-by-step preparation blueprint for SSC CGL covering Tier-I qualifying strategy, Tier-II weightage optimization, Computer Qualifying module, and revision cycles.",
    examCategory: "SSC_CGL",
    resourceType: "ROADMAP",
    subject: "Study Roadmaps",
    categorySlug: "study-roadmaps",
    accessType: "FREE",
    coverAccent: "#1E40AF",
    pageCount: 22,
    isFeatured: true,
    downloadCount: 1760,
    authorSource: "SSPH Mentorship Desk (DEMO)",
    pdfSpec: {
      title: "SSC CGL Preparation Roadmap - Tier-I to Tier-II Mastery",
      exam: "SSC CGL",
      subject: "Study Roadmaps",
      authorSource: "SSPH Mentorship Desk (DEMO)",
      summary:
        "DEMO comprehensive strategy guide detailing subject weightage, sectional accuracy benchmarks, and Computer Knowledge preparation.",
      sections: [
        {
          heading: "1. Tier-I & Tier-II Priority Matrix",
          bullets: [
            "Tier-II Merit Sections: Mathematical Abilities + Reasoning (180 marks) & English + GA (210 marks).",
            "Never neglect Module-II Computer Knowledge (qualifying threshold must be cleared comfortably).",
          ],
        },
        {
          heading: "2. Mock Analysis Loop",
          bullets: [
            "Tag every incorrect question: Conceptual Gap, Silly Calculation Error, or Time Trap.",
            "Re-attempt flagged PYQs every Sunday until error rate drops below 5%.",
          ],
        },
      ],
    },
  },
  {
    slug: "current-affairs-compilation-demo",
    title: "Current Affairs Compilation (6-Month Exam Digest)",
    description:
      "DEMO resource: Curated exam-relevant capsule covering Union Appointments, Padma & Literary Awards, Sports Championships, Government Schemes, and Science & Defence updates.",
    examCategory: "ALL_SSC",
    resourceType: "CURRENT_AFFAIRS",
    subject: "Current Affairs",
    categorySlug: "current-affairs",
    accessType: "AD_SUPPORTED",
    coverAccent: "#2563EB",
    pageCount: 40,
    isFeatured: true,
    downloadCount: 1290,
    authorSource: "SSPH Current Affairs Desk (DEMO)",
    pdfSpec: {
      title: "SSC Current Affairs Compilation - Exam Capsule",
      exam: "All SSC Exams",
      subject: "Current Affairs",
      authorSource: "SSPH Current Affairs Desk (DEMO)",
      summary:
        "DEMO current affairs compendium organized into topic-wise one-liners and policy highlights tailored to SSC General Awareness questions.",
      sections: [
        {
          heading: "1. High-Yield Current Affairs Categories",
          bullets: [
            "National Policies & Flagship Schemes: Launch year, nodal ministry, and target beneficiaries.",
            "Sports & Honours: Grand Slams, Asian/Commonwealth medal tallies, National Film & Sahitya awards.",
            "Indices & Summits: India rank, publishing organization, and host city.",
          ],
        },
      ],
    },
  },
  {
    slug: "ssc-cgl-previous-year-practice-set-demo",
    title: "SSC CGL Previous Year Practice Set (Solved Compilation)",
    description:
      "DEMO resource: Model solved compilation modeled on recent SSC CGL Tier-I & Tier-II shifts with detailed step-by-step explanations and shortcut solutions.",
    examCategory: "SSC_CGL",
    resourceType: "PYQ",
    subject: "Previous Year Questions",
    categorySlug: "previous-year-questions",
    accessType: "PREMIUM",
    coverAccent: "#101B33",
    pageCount: 92,
    isFeatured: true,
    downloadCount: 1580,
    authorSource: "SSPH PYQ Archive (DEMO)",
    pdfSpec: {
      title: "SSC CGL Previous Year Practice Set (Solved Model Compilation)",
      exam: "SSC CGL",
      subject: "Previous Year Questions",
      authorSource: "SSPH PYQ Archive (DEMO)",
      summary:
        "DEMO solved compilation demonstrating full-length question structure and concise solution walkthroughs across all four Tier-I subjects.",
      sections: [
        {
          heading: "1. Sample Solved Set Highlights",
          bullets: [
            "Quant: Ratio & Trigonometry worked solutions using value-putting and elimination.",
            "English: Cloze test contextual elimination and active-passive transformation rules.",
            "General Awareness: Static + Current integration notes for each question.",
          ],
        },
      ],
    },
  },
  {
    slug: "ssc-chsl-previous-year-practice-set-demo",
    title: "SSC CHSL Previous Year Practice Set (Solved Shifts)",
    description:
      "DEMO resource: Shift-wise practice compilation for SSC CHSL covering Quantitative Aptitude, General Intelligence, English Comprehension, and General Awareness.",
    examCategory: "SSC_CHSL",
    resourceType: "PYQ",
    subject: "Previous Year Questions",
    categorySlug: "previous-year-questions",
    accessType: "AD_SUPPORTED",
    coverAccent: "#1D4ED8",
    pageCount: 74,
    isFeatured: false,
    downloadCount: 910,
    authorSource: "SSPH PYQ Archive (DEMO)",
    pdfSpec: {
      title: "SSC CHSL Previous Year Practice Set",
      exam: "SSC CHSL",
      subject: "Previous Year Questions",
      authorSource: "SSPH PYQ Archive (DEMO)",
      summary:
        "DEMO practice compilation structured around SSC CHSL Tier-I 100-question format with answer keys and short notes.",
      sections: [
        {
          heading: "1. Section Breakdown",
          bullets: [
            "25 Questions English | 25 Questions Reasoning | 25 Questions Quant | 25 Questions GA.",
            "Includes accuracy target benchmarks (80%+ accuracy, <18 min Reasoning, <22 min Quant).",
          ],
        },
      ],
    },
  },
  {
    slug: "ssc-computer-knowledge-tier2-book-demo",
    title: "Computer Knowledge Tier-II Preparation Book",
    description:
      "DEMO resource: Complete qualifying module handbook covering Computer Architecture, Memory Hierarchy, MS Word/Excel shortcuts, Networking OSI layers, and Cyber Security.",
    examCategory: "SSC_CGL",
    resourceType: "BOOK",
    subject: "Computer Knowledge",
    categorySlug: "computer-knowledge",
    accessType: "PREMIUM",
    coverAccent: "#0F172A",
    pageCount: 56,
    isFeatured: false,
    downloadCount: 780,
    authorSource: "SSPH Editorial Team (DEMO)",
    pdfSpec: {
      title: "SSC Tier-II Computer Knowledge Handbook",
      exam: "SSC CGL & CHSL Tier-II",
      subject: "Computer Knowledge",
      authorSource: "SSPH Editorial Team (DEMO)",
      summary:
        "DEMO handbook covering CPU registers, cache memory, protocols (HTTP/HTTPS/SMTP/DNS), Excel formulas, and cyber-attack classifications.",
      sections: [
        {
          heading: "1. Networking & MS Office Essentials",
          bullets: [
            "7 OSI Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
            "Common Ports: HTTP (80), HTTPS (443), FTP (20/21), SSH (22), SMTP (25), DNS (53).",
            "Excel Shortcuts: Ctrl+Shift+L (Filter), F2 (Edit cell), Alt+= (AutoSum).",
          ],
        },
      ],
    },
  },
  {
    slug: "ssc-gd-general-awareness-economics-demo",
    title: "SSC GD Economics & Static GK Capsule",
    description:
      "DEMO resource: Beginner-friendly study notes on Five-Year Plans, RBI Monetary Policy tools, Banking terms, Census highlights, and Indian Folk Dances for SSC GD & MTS.",
    examCategory: "SSC_GD",
    resourceType: "BOOK",
    subject: "Economics",
    categorySlug: "economics",
    accessType: "FREE",
    coverAccent: "#1E3A8A",
    pageCount: 36,
    isFeatured: false,
    downloadCount: 690,
    authorSource: "SSPH GS Research (DEMO)",
    pdfSpec: {
      title: "SSC GD Economics & Static GK Capsule",
      exam: "SSC GD / MTS",
      subject: "Economics",
      authorSource: "SSPH GS Research (DEMO)",
      summary:
        "DEMO concise booklet focusing on Indian Economy basics, NITI Aayog, and Static General Knowledge essentials.",
      sections: [
        {
          heading: "1. Monetary & Fiscal Highlights",
          bullets: [
            "RBI Quantitative Tools: Repo Rate, Reverse Repo, CRR, SLR, Bank Rate, Open Market Operations.",
            "GST Constitutional Amendment: 101st Amendment Act implemented on 1 July 2017.",
          ],
        },
      ],
    },
  },
];

async function main() {
  console.log("Seeding SSPH database...");

  const categoryMap = new Map<string, string>();
  for (let i = 0; i < REQUIRED_CATEGORIES.length; i++) {
    const cat = REQUIRED_CATEGORIES[i];
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        iconName: cat.iconName,
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        iconName: cat.iconName,
        sortOrder: i + 1,
        isActive: true,
      },
    });
    categoryMap.set(cat.slug, upserted.id);
  }
  console.log(`Seeded ${categoryMap.size} categories.`);

  const pdfDir = path.resolve(process.cwd(), "storage", "pdfs");
  for (const item of SAMPLE_RESOURCES) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug ${item.categorySlug}`);
    }

    const fileName = `${item.slug}.pdf`;
    const diskPath = path.join(pdfDir, fileName);
    const { byteLength, buffer } = await writeSamplePdfFile(diskPath, item.pdfSpec);
    const sizeKb = Math.max(1, Math.round(byteLength / 1024));
    const fileSizeLabel = `${sizeKb} KB (Demo PDF)`;

    const sampleInfo = await inspectAndCreateSamplePdf(buffer, item.slug);
    const shortDesc = `${item.title} — ${item.subject} PDF for ${formatExamLabel(item.examCategory)}.`.slice(
      0,
      120
    );
    const examList = [formatExamLabel(item.examCategory), "SSC CGL", "SSC CHSL"];
    const tagList = [
      `${item.subject.toLowerCase()} ssc pdf`,
      `${formatExamLabel(item.examCategory).toLowerCase()} notes`,
      `${item.subject.toLowerCase()} study material`,
    ];

    await prisma.resource.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        shortDescription: shortDesc,
        examCategory: item.examCategory,
        resourceType: item.resourceType,
        subject: item.subject,
        categoryId,
        coverImageUrl: sampleInfo.thumbnailUrl,
        coverAccent: item.coverAccent,
        storageType: "LOCAL_DEMO_PDF",
        storagePath: `pdfs/${fileName}`,
        sampleStoragePath: sampleInfo.sampleStoragePath,
        samplePageCount: sampleInfo.samplePageCount,
        fileFormat: "PDF",
        fileSizeLabel,
        pageCount: sampleInfo.totalPages,
        authorSource: item.authorSource,
        author: item.authorSource,
        language: "English",
        difficulty: "intermediate",
        genreJson: JSON.stringify(["Competitive Exam Prep", item.subject]),
        subjectsJson: JSON.stringify([item.subject]),
        examRelevanceJson: JSON.stringify(Array.from(new Set(examList))),
        tagsJson: JSON.stringify(tagList),
        accessType: item.accessType,
        isPublished: true,
        isFeatured: item.isFeatured,
        isDemo: true,
      },
      create: {
        slug: item.slug,
        title: item.title,
        description: item.description,
        shortDescription: shortDesc,
        examCategory: item.examCategory,
        resourceType: item.resourceType,
        subject: item.subject,
        categoryId,
        coverImageUrl: sampleInfo.thumbnailUrl,
        coverAccent: item.coverAccent,
        storageType: "LOCAL_DEMO_PDF",
        storagePath: `pdfs/${fileName}`,
        sampleStoragePath: sampleInfo.sampleStoragePath,
        samplePageCount: sampleInfo.samplePageCount,
        fileFormat: "PDF",
        fileSizeLabel,
        pageCount: sampleInfo.totalPages,
        authorSource: item.authorSource,
        author: item.authorSource,
        language: "English",
        difficulty: "intermediate",
        genreJson: JSON.stringify(["Competitive Exam Prep", item.subject]),
        subjectsJson: JSON.stringify([item.subject]),
        examRelevanceJson: JSON.stringify(Array.from(new Set(examList))),
        tagsJson: JSON.stringify(tagList),
        accessType: item.accessType,
        isPublished: true,
        isFeatured: item.isFeatured,
        isDemo: true,
        downloadCount: item.downloadCount,
        viewCount: item.downloadCount * 2,
      },
    });
  }
  console.log(`Seeded ${SAMPLE_RESOURCES.length} DEMO resources + valid PDF files in storage/pdfs.`);

  // Optional initial admin seed ONLY when explicitly configured via env vars
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD?.trim();
  const adminName = process.env.ADMIN_SEED_NAME?.trim() || "SSPH Administrator";

  if (adminEmail && adminPassword && adminPassword.length >= 8) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "ADMIN",
        isActive: true,
      },
      create: {
        email: adminEmail,
        name: adminName,
        passwordHash: hashPassword(adminPassword),
        role: "ADMIN",
        membershipTier: "LIFETIME",
        lifetimeActivatedAt: new Date(),
      },
    });
    console.log(`Admin account ready for ${adminEmail} (from environment variables).`);
  } else {
    console.log(
      "Skipped creating default admin user (ADMIN_SEED_PASSWORD not set). Run `npm run admin:create -- --email=... --password=...` to create your first admin securely."
    );
  }
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
