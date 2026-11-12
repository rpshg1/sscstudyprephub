export const SUBSCRIPTIONS_ENABLED: boolean = false;

export const BRAND = {
  name: "SSCSTUDYPREPHUB",
  shortName: "SSPH",
  tagline: "One Hub. Every Preparation Resource.",
  heroHeading: "Prepare Smarter. Score Higher.",
  heroSubtitle:
    "Discover structured study notes, previous year question papers (PYQs), preparation roadmaps, current affairs PDFs, and exam-focused books for SSC CGL, CHSL, MTS, CPO, and GD aspirants.",
  supportEmail: "sscstudyprephub@gmail.com",
  copyrightEmail: "sscstudyprephub@gmail.com",
  disclaimerShort:
    "SSPH is an independent educational platform and is not affiliated with the Staff Selection Commission (SSC) or the Government of India.",
} as const;

export const PRICING_PLANS = {
  FREE: {
    code: "FREE",
    title: "FREE",
    priceInr: 0,
    priceDisplay: "₹0",
    billingLabel: "Forever Free",
    description:
      "Browse the complete public catalog and unlock ad-supported study PDFs via verified advertisements.",
    features: [
      "Browse the complete public library",
      "Direct download for open free resources",
      "Watch eligible rewarded ads or ad-supported links to unlock supported PDFs",
      "Save favourite resources in your student dashboard",
      "No membership fee",
    ],
  },
  TEN_BOOKS: {
    code: "TEN_BOOKS",
    title: "10 BOOKS",
    priceInr: 59,
    pricePaise: 5900,
    priceDisplay: "₹59",
    credits: 10,
    billingLabel: "One-time payment",
    description:
      "Get 10 download credits for eligible books, notes, PYQs, and roadmaps with zero individual ad unlocks.",
    features: [
      "Download any 10 eligible books or resources",
      "10 transparent download credits in your dashboard",
      "No individual ad unlock required for eligible resources",
      "1 credit deducted per unique resource unlocked (never double-charged)",
      "Re-download previously unlocked resources anytime without extra credits",
    ],
  },
  LIFETIME: {
    code: "LIFETIME",
    title: "LIFETIME PREMIUM",
    priceInr: 300,
    pricePaise: 30000,
    priceDisplay: "₹300",
    billingLabel: "One-time payment • Lifetime access",
    description:
      "Unlimited direct downloads across all eligible books, notes, PYQs, roadmaps, and future additions.",
    features: [
      "Lifetime access to all eligible premium & ad-supported resources",
      "Unlimited direct PDF downloads with zero ads",
      "Full access to books, notes, PYQs, current affairs & roadmaps",
      "All future eligible SSPH resource additions included",
      "For the lifetime of the SSPH service, subject to published terms",
    ],
  },
} as const;

export const EXAM_OPTIONS = [
  { value: "SSC_CGL", label: "SSC CGL", fullName: "Combined Graduate Level" },
  { value: "SSC_CHSL", label: "SSC CHSL", fullName: "Combined Higher Secondary Level" },
  { value: "SSC_MTS", label: "SSC MTS", fullName: "Multi-Tasking Staff" },
  { value: "SSC_CPO", label: "SSC CPO", fullName: "Central Police Organisation (SI)" },
  { value: "SSC_GD", label: "SSC GD", fullName: "General Duty Constable" },
  { value: "ALL_SSC", label: "All SSC Exams", fullName: "Common across SSC Tiers" },
] as const;

export const RESOURCE_TYPE_OPTIONS = [
  { value: "BOOK", label: "Preparation Books" },
  { value: "NOTES", label: "Study Notes" },
  { value: "PYQ", label: "Previous Year Questions" },
  { value: "ROADMAP", label: "Study Roadmaps" },
  { value: "CURRENT_AFFAIRS", label: "Current Affairs" },
  { value: "PRACTICE_SET", label: "Practice Sets" },
] as const;

export const ACCESS_TYPE_OPTIONS = [
  { value: "FREE", label: "Free" },
  { value: "AD_SUPPORTED", label: "Ad-Supported" },
  { value: "PREMIUM", label: "Premium" },
] as const;

export const REQUIRED_CATEGORIES = [
  {
    name: "Preparation Books",
    slug: "preparation-books",
    description: "Structured textbooks, reference guides, and topic compendiums for SSC tiers.",
    iconName: "BookOpen",
  },
  {
    name: "Study Notes",
    slug: "study-notes",
    description: "Concise chapter-wise revision notes and formula sheets.",
    iconName: "FileText",
  },
  {
    name: "Previous Year Questions",
    slug: "previous-year-questions",
    description: "Shift-wise and topic-wise PYQ compilations with detailed solutions.",
    iconName: "History",
  },
  {
    name: "Study Roadmaps",
    slug: "study-roadmaps",
    description: "Week-by-week preparation planners, booklists, and score strategies.",
    iconName: "Map",
  },
  {
    name: "Current Affairs",
    slug: "current-affairs",
    description: "Monthly and exam-focused national, international, and scheme digests.",
    iconName: "Newspaper",
  },
  {
    name: "General Knowledge",
    slug: "general-knowledge",
    description: "Static GK capsules covering awards, books, folk dances, and institutions.",
    iconName: "Globe",
  },
  {
    name: "Mathematics",
    slug: "mathematics",
    description: "Quantitative Aptitude notes covering Arithmetic and Advanced Maths.",
    iconName: "Calculator",
  },
  {
    name: "English",
    slug: "english",
    description: "Grammar rules, vocabulary, idioms, one-word substitution, and comprehension.",
    iconName: "Languages",
  },
  {
    name: "Reasoning",
    slug: "reasoning",
    description: "General Intelligence & Reasoning verbal and non-verbal practice sets.",
    iconName: "Brain",
  },
  {
    name: "General Awareness",
    slug: "general-awareness",
    description: "Combined Tier-I and Tier-II General Awareness high-yield question banks.",
    iconName: "Lightbulb",
  },
  {
    name: "Indian Polity",
    slug: "indian-polity",
    description: "Constitution, Fundamental Rights, Parliament, Amendments, and Bodies.",
    iconName: "Scale",
  },
  {
    name: "History",
    slug: "history",
    description: "Ancient, Medieval, and Modern Indian History chronological revision notes.",
    iconName: "Landmark",
  },
  {
    name: "Geography",
    slug: "geography",
    description: "Indian and World Geography including rivers, passes, soils, and climate.",
    iconName: "Compass",
  },
  {
    name: "Economics",
    slug: "economics",
    description: "Macroeconomics, Five-Year Plans, RBI monetary policy, and Union Budget.",
    iconName: "TrendingUp",
  },
  {
    name: "General Science",
    slug: "general-science",
    description: "NCERT-aligned Physics, Chemistry, and Biology quick revision notes.",
    iconName: "FlaskConical",
  },
  {
    name: "Computer Knowledge",
    slug: "computer-knowledge",
    description: "Tier-II qualifying Computer Proficiency notes: networking, MS Office, security.",
    iconName: "Laptop",
  },
] as const;

export const HOME_FAQS = [
  {
    question: "Are SSC study books and notes free on SSCSTUDYPREPHUB?",
    answer:
      "Yes. All paid subscriptions and passes are currently paused—every available public study book, note, PYQ compilation, and roadmap is free to access either directly or via an ad-supported download link.",
  },
  {
    question: "How do ad-supported PDF downloads work?",
    answer:
      "Open-access resources download directly in one click. Ad-supported resources open a verified short advertisement link (such as ShrinkMe.io) and automatically redirect you to the PDF download after completion—no paid subscription required.",
  },
  {
    question: "Do I need an account to read sample pages?",
    answer:
      "No. You can search the entire library and read opening sample pages directly in your browser without signing up. Creating a free account lets you bookmark favorite study material and track downloads.",
  },
  {
    question: "Is SSCSTUDYPREPHUB affiliated with SSC or the Government of India?",
    answer:
      "No. SSCSTUDYPREPHUB (SSPH) is an independent educational resource platform built to help aspirants prepare efficiently. We are not affiliated with, endorsed by, or connected to the Staff Selection Commission (SSC) or any government agency.",
  },
  {
    question: "How can an author or publisher request removal of a book?",
    answer:
      "All PDFs indexed on SSPH are curated from publicly available educational links across the web. If you are an author or copyright holder requesting removal, email sscstudyprephub@gmail.com or use the Copyright & DMCA form and the resource will be removed promptly.",
  },
] as const;

export function formatExamLabel(exam: string): string {
  const found = EXAM_OPTIONS.find((item) => item.value === exam);
  return found ? found.label : exam.replace(/_/g, " ");
}

export function formatResourceTypeLabel(type: string): string {
  const found = RESOURCE_TYPE_OPTIONS.find((item) => item.value === type);
  return found ? found.label : type.replace(/_/g, " ");
}

export function formatAccessTypeLabel(access: string): string {
  const found = ACCESS_TYPE_OPTIONS.find((item) => item.value === access);
  return found ? found.label : access;
}
