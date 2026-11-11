import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

export const SeoBookMetadataSchema = z.object({
  title: z.string().min(1),
  author: z.string().default(""),
  publisher: z.string().default(""),
  yearPublished: z.coerce.number().int().min(0).default(0),
  language: z.string().default("English"),
  edition: z.string().default(""),
  totalPages: z.coerce.number().int().min(0).default(0),
  isbn: z.string().default(""),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  description: z.string().min(20),
  shortDescription: z.string().default(""),
  genre: z.array(z.string()).default([]),
  subject: z.array(z.string()).default([]),
  examRelevance: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export type SeoBookMetadata = z.infer<typeof SeoBookMetadataSchema>;

export interface BookHintInput {
  rawFileName?: string;
  title?: string;
  author?: string;
  edition?: string;
  language?: string;
  year?: number | string;
  actualPdfPages?: number;
  extractedPdfText?: string;
}

export function parseHintsFromFilename(fileName: string): {
  title: string;
  author: string;
  edition: string;
  year: number;
} {
  const withoutExt = fileName.replace(/\.pdf$/i, "").replace(/[_]+/g, " ").trim();
  const yearMatch = withoutExt.match(/\b(19\d{2}|20[0-3]\d)\b/);
  const year = yearMatch ? Number(yearMatch[1]) : 0;

  const editionMatch = withoutExt.match(
    /\b(\d+(?:st|nd|rd|th)\s+Edition|Revised\s+Edition|Latest\s+Edition)\b/i
  );
  const edition = editionMatch ? editionMatch[1] : "";

  const cleaned = withoutExt
    .replace(/\b(19\d{2}|20[0-3]\d)\b/g, " ")
    .replace(/\b(\d+(?:st|nd|rd|th)\s+Edition|Revised\s+Edition|Latest\s+Edition)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  let author = "";
  let title = cleaned;
  const byMatch = cleaned.match(/\bby\s+([A-Za-z.\s]{3,50})$/i);
  if (byMatch) {
    author = byMatch[1].trim();
    title = cleaned.slice(0, byMatch.index).trim();
  }

  return {
    title: title || withoutExt,
    author,
    edition,
    year,
  };
}

interface WebBookFact {
  source: string;
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedYear?: number;
  pageCount?: number;
  isbn?: string;
  categories?: string[];
  description?: string;
  thumbnailUrl?: string;
}

async function searchGoogleBooks(query: string): Promise<WebBookFact | null> {
  try {
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "3");
    if (process.env.GOOGLE_DRIVE_API_KEY?.trim()) {
      url.searchParams.set("key", process.env.GOOGLE_DRIVE_API_KEY.trim());
    }
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      items?: Array<{
        volumeInfo?: {
          title?: string;
          authors?: string[];
          publisher?: string;
          publishedDate?: string;
          pageCount?: number;
          categories?: string[];
          description?: string;
          industryIdentifiers?: Array<{ type?: string; identifier?: string }>;
          imageLinks?: { thumbnail?: string };
        };
      }>;
    };
    const vol = data.items?.[0]?.volumeInfo;
    if (!vol) return null;

    const yearMatch = vol.publishedDate?.match(/\b(19\d{2}|20[0-3]\d)\b/);
    const isbn13 =
      vol.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ||
      vol.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier ||
      "";

    return {
      source: "Google Books",
      title: vol.title,
      authors: vol.authors,
      publisher: vol.publisher,
      publishedYear: yearMatch ? Number(yearMatch[1]) : 0,
      pageCount: vol.pageCount || 0,
      isbn: isbn13,
      categories: vol.categories,
      description: vol.description,
      thumbnailUrl: vol.imageLinks?.thumbnail?.replace(/^http:/, "https:"),
    };
  } catch {
    return null;
  }
}

async function searchOpenLibrary(query: string): Promise<WebBookFact | null> {
  try {
    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "2");
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      docs?: Array<{
        title?: string;
        author_name?: string[];
        publisher?: string[];
        first_publish_year?: number;
        number_of_pages_median?: number;
        isbn?: string[];
        subject?: string[];
      }>;
    };
    const doc = data.docs?.[0];
    if (!doc) return null;
    return {
      source: "Open Library",
      title: doc.title,
      authors: doc.author_name,
      publisher: doc.publisher?.[0],
      publishedYear: doc.first_publish_year || 0,
      pageCount: doc.number_of_pages_median || 0,
      isbn: doc.isbn?.[0] || "",
      categories: doc.subject?.slice(0, 6),
    };
  } catch {
    return null;
  }
}

function inferExamAndSubjects(text: string): {
  genre: string[];
  subject: string[];
  examRelevance: string[];
  tags: string[];
} {
  const lower = text.toLowerCase();
  const exams: string[] = [];
  if (lower.includes("cgl")) exams.push("SSC CGL");
  if (lower.includes("chsl")) exams.push("SSC CHSL");
  if (lower.includes("mts")) exams.push("SSC MTS");
  if (lower.includes("cpo")) exams.push("SSC CPO");
  if (lower.includes("gd")) exams.push("SSC GD");
  if (lower.includes("upsc") || lower.includes("ias")) exams.push("UPSC");
  if (lower.includes("ibps") || lower.includes("bank")) exams.push("IBPS PO/Clerk");
  if (lower.includes("rrb") || lower.includes("railway")) exams.push("RRB NTPC");
  if (lower.includes("cds")) exams.push("CDS");
  if (lower.includes("nda")) exams.push("NDA");
  if (exams.length === 0) {
    exams.push("SSC CGL", "SSC CHSL", "SSC MTS", "SSC CPO", "RRB NTPC");
  }

  const subjects: string[] = [];
  if (/math|quant|arithmetic|algebra|trigonometry|geometry/.test(lower))
    subjects.push("Quantitative Aptitude", "Arithmetic", "Algebra", "Geometry");
  if (/english|grammar|vocab|comprehension|idiom/.test(lower))
    subjects.push("English Grammar", "Vocabulary", "Reading Comprehension");
  if (/reason|syllogism|coding|puzzle/.test(lower))
    subjects.push("General Intelligence", "Logical Reasoning");
  if (/polity|constitution|parliament/.test(lower))
    subjects.push("Indian Polity", "Constitution of India");
  if (/history|ancient|medieval|modern/.test(lower))
    subjects.push("Indian History", "Freedom Struggle");
  if (/geography|river|monsoon/.test(lower))
    subjects.push("Indian Geography", "Physical Geography");
  if (/science|physics|chemistry|biology/.test(lower))
    subjects.push("General Science", "Physics", "Chemistry", "Biology");
  if (/econom|rbi|budget|fiscal/.test(lower))
    subjects.push("Indian Economy", "Macroeconomics");
  if (/computer|network|excel|osi/.test(lower))
    subjects.push("Computer Knowledge", "MS Office", "Networking");
  if (/current affair|digest|scheme/.test(lower))
    subjects.push("Current Affairs", "Government Schemes");
  if (subjects.length === 0) {
    subjects.push("General Awareness", "Competitive Exam Preparation");
  }

  const genre = ["Competitive Exam Prep", subjects[0] || "Study Guide"];
  const baseTag = text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 4)
    .join(" ");

  const tags = Array.from(
    new Set([
      `${baseTag} pdf`,
      `${baseTag} pdf download`,
      `${exams[0]} ${subjects[0]} notes`,
      `${baseTag} book in english`,
      `${exams[0]} taiyari pdf`,
      `ssc study material free pdf`,
    ])
  );

  return { genre, subject: subjects, examRelevance: exams, tags };
}

function buildSeoPrompt(params: {
  title: string;
  author: string;
  edition: string;
  language: string;
  year: string;
  webContext: string;
  pdfSnippet: string;
}): string {
  return `You are an SEO metadata expert for an Indian educational PDF library.

Book details:
- Title: ${params.title}
- Author: ${params.author || "Unknown"}
- Edition: ${params.edition || "Not specified"}
- Language: ${params.language || "English"}
- Year: ${params.year || "Unknown"}

Verified Web & PDF Context (use this only as factual grounding; never fabricate missing ISBN, year, or page counts):
${params.webContext}
PDF First Pages Excerpt:
${params.pdfSnippet.slice(0, 2200) || "Not extracted"}

Search the web for accurate details about this book, then generate metadata JSON.

RULES:
1. TITLE — Keep the original title.
2. DESCRIPTION — 1000-1400 words. Hook (what the student gains), the real chapters/topics covered, who it's for (every relevant Indian exam: SSC CGL, UPSC, IBPS PO/Clerk, NEET, JEE, RRB, GATE, State PSC, NDA, CDS — only relevant ones), author credibility, and 2–3 warm closing lines. Conversational, no fluff words like "comprehensive" or "invaluable".
3. SHORT DESCRIPTION — One punchy line, max 120 characters.
4. GENRE — Broad categories e.g. ["Mathematics", "Competitive Exam Prep"]
5. SUBJECT — Specific topics e.g. ["Algebra", "Trigonometry"]
6. EXAM RELEVANCE — Every Indian exam this book is useful for.
7. TAGS — What students actually Google (mix English + Hinglish).
8. DIFFICULTY — "beginner" | "intermediate" | "advanced"
Never invent an ISBN, year or page count — leave it empty if unsure.

Return ONLY valid JSON. No explanation, no markdown, no backticks. Start with { end with }

{
  "title": "",
  "author": "",
  "publisher": "",
  "yearPublished": 0,
  "language": "English",
  "edition": "",
  "totalPages": 0,
  "isbn": "",
  "difficulty": "intermediate",
  "description": "",
  "shortDescription": "",
  "genre": [],
  "subject": [],
  "examRelevance": [],
  "tags": []
}`;
}

function stripFluffWords(text: string): string {
  return text
    .replace(/\bcomprehensive\b/gi, "detailed")
    .replace(/\binvaluable\b/gi, "helpful")
    .trim();
}

export async function enrichBookMetadata(hints: BookHintInput): Promise<{
  metadata: SeoBookMetadata;
  coverThumbnailUrl: string | null;
  sourceMode: "gemini_web_search" | "open_web_verified";
}> {
  const parsedName = hints.rawFileName
    ? parseHintsFromFilename(hints.rawFileName)
    : { title: "", author: "", edition: "", year: 0 };

  const title = (hints.title || parsedName.title || "SSC Study Resource").trim();
  const author = (hints.author || parsedName.author || "").trim();
  const edition = (hints.edition || parsedName.edition || "").trim();
  const language = (hints.language || "English").trim();
  const yearNum = Number(hints.year) || parsedName.year || 0;

  const queryString = [title, author].filter(Boolean).join(" ");
  const [googleBook, openLibBook] = await Promise.all([
    searchGoogleBooks(queryString),
    searchOpenLibrary(queryString),
  ]);

  const mergedAuthor =
    author ||
    googleBook?.authors?.join(", ") ||
    openLibBook?.authors?.join(", ") ||
    "";
  const mergedPublisher = googleBook?.publisher || openLibBook?.publisher || "";
  const mergedYear =
    yearNum || googleBook?.publishedYear || openLibBook?.publishedYear || 0;
  const mergedIsbn = googleBook?.isbn || openLibBook?.isbn || "";
  const mergedPages =
    hints.actualPdfPages || googleBook?.pageCount || openLibBook?.pageCount || 0;

  const webContext = [
    googleBook
      ? `Google Books: title="${googleBook.title}", authors=${JSON.stringify(
          googleBook.authors
        )}, publisher="${googleBook.publisher || ""}", year=${
          googleBook.publishedYear || 0
        }, isbn="${googleBook.isbn || ""}", pages=${
          googleBook.pageCount || 0
        }, description="${(googleBook.description || "").slice(0, 800)}"`
      : "Google Books: no direct match",
    openLibBook
      ? `Open Library: title="${openLibBook.title}", authors=${JSON.stringify(
          openLibBook.authors
        )}, publisher="${openLibBook.publisher || ""}", year=${
          openLibBook.publishedYear || 0
        }, isbn="${openLibBook.isbn || ""}"`
      : "Open Library: no direct match",
  ].join("\n");

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const prompt = buildSeoPrompt({
        title,
        author: mergedAuthor,
        edition,
        language,
        year: mergedYear ? String(mergedYear) : "",
        webContext,
        pdfSnippet: hints.extractedPdfText || "",
      });

      const interaction = await ai.interactions.create({
        model: "gemini-3.8-flash",
        input: prompt,
        tools: [{ type: "google_search" }],
        response_format: {
          type: "object",
          properties: {
            title: { type: "string" },
            author: { type: "string" },
            publisher: { type: "string" },
            yearPublished: { type: "integer" },
            language: { type: "string" },
            edition: { type: "string" },
            totalPages: { type: "integer" },
            isbn: { type: "string" },
            difficulty: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
            },
            description: { type: "string" },
            shortDescription: { type: "string" },
            genre: { type: "array", items: { type: "string" } },
            subject: { type: "array", items: { type: "string" } },
            examRelevance: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } },
          },
          required: [
            "title",
            "author",
            "publisher",
            "yearPublished",
            "language",
            "edition",
            "totalPages",
            "isbn",
            "difficulty",
            "description",
            "shortDescription",
            "genre",
            "subject",
            "examRelevance",
            "tags",
          ],
        },
      });

      const rawOutput = (interaction.output_text || "").trim();
      const cleanedJson = rawOutput
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      if (cleanedJson.startsWith("{")) {
        const parsed = SeoBookMetadataSchema.parse(JSON.parse(cleanedJson));
        parsed.title = title; // Rule 1: Keep the original title
        parsed.description = stripFluffWords(parsed.description);
        parsed.shortDescription = parsed.shortDescription.slice(0, 120);
        if (hints.actualPdfPages && !parsed.totalPages) {
          parsed.totalPages = hints.actualPdfPages;
        }
        return {
          metadata: parsed,
          coverThumbnailUrl: googleBook?.thumbnailUrl ?? null,
          sourceMode: "gemini_web_search",
        };
      }
    } catch (err) {
      console.warn("Gemini SEO enrichment fallback activated:", err);
    }
  }

  // Verified Open-Web + PDF Fallback Builder (never invents ISBN or year)
  const inferred = inferExamAndSubjects(
    `${title} ${googleBook?.description || ""} ${hints.extractedPdfText || ""}`
  );
  const shortDescription = `${title} — exam-focused ${inferred.subject[0] || "study"} PDF for ${inferred.examRelevance.slice(0, 2).join(" & ")}.`.slice(
    0,
    120
  );

  const webSummary = googleBook?.description
    ? stripFluffWords(googleBook.description)
    : `Designed for serious Indian competitive exam aspirants, ${title}${
        mergedAuthor ? ` by ${mergedAuthor}` : ""
      } focuses on clarity, speed, and exam-pattern accuracy across ${inferred.subject.join(
        ", "
      )}.`;

  const tocExcerpt = hints.extractedPdfText
    ? `\n\nInside the Opening Pages:\n${hints.extractedPdfText.slice(0, 600)}`
    : "";

  const fullDescription = `${webSummary}${tocExcerpt}\n\nTarget Examinations: ${inferred.examRelevance.join(
    ", "
  )}. Preview the first 10–15 pages directly on SSPH before downloading the complete ${
    mergedPages ? `${mergedPages}-page ` : ""
  }PDF.`;

  const fallbackMeta = SeoBookMetadataSchema.parse({
    title,
    author: mergedAuthor,
    publisher: mergedPublisher,
    yearPublished: mergedYear,
    language,
    edition,
    totalPages: mergedPages,
    isbn: mergedIsbn,
    difficulty: "intermediate",
    description: stripFluffWords(fullDescription),
    shortDescription,
    genre: googleBook?.categories?.length ? googleBook.categories : inferred.genre,
    subject: inferred.subject,
    examRelevance: inferred.examRelevance,
    tags: inferred.tags,
  });

  return {
    metadata: fallbackMeta,
    coverThumbnailUrl: googleBook?.thumbnailUrl ?? null,
    sourceMode: "open_web_verified",
  };
}
