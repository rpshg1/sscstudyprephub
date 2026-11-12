"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CloudCog,
  CreditCard,
  Download,
  Edit3,
  FolderKanban,
  IndianRupee,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import {
  ACCESS_TYPE_OPTIONS,
  EXAM_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
  formatExamLabel,
} from "@/lib/constants";

interface AdminProps {
  currentAdminId: string;
  stats: {
    totalResources: number;
    totalUsers: number;
    premiumUsers: number;
    totalDownloads: number;
    totalRevenueInr: number;
  };
  resources: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    examCategory: string;
    resourceType: string;
    subject: string;
    categoryId: string;
    coverImageUrl: string | null;
    coverAccent: string;
    storageType: string;
    protectedFileUrl: string | null;
    storagePath: string | null;
    driveFileId: string | null;
    sampleStoragePath: string | null;
    samplePageCount: number | null;
    adShortlinkUrl: string | null;
    fileFormat: string;
    fileSizeLabel: string;
    pageCount: number | null;
    authorSource: string;
    shortDescription: string | null;
    author: string | null;
    publisher: string | null;
    yearPublished: number | null;
    language: string;
    edition: string | null;
    isbn: string | null;
    difficulty: string;
    genreJson: string | null;
    subjectsJson: string | null;
    examRelevanceJson: string | null;
    tagsJson: string | null;
    accessType: string;
    isPublished: boolean;
    isFeatured: boolean;
    isDemo: boolean;
    downloadCount: number;
    category: { id: string; name: string };
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
    _count: { resources: number };
  }>;
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    membershipTier: string;
    bookCredits: number;
    isActive: boolean;
    createdAt: string;
    _count: { downloads: number; purchases: number };
  }>;
  purchases: Array<{
    id: string;
    planType: string;
    amountPaise: number;
    status: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    createdAt: string;
    user: { name: string; email: string };
  }>;
  analytics: {
    methodBreakdown: Array<{ method: string; count: number }>;
    adSessionStats: Array<{ provider: string; status: string; count: number }>;
  };
  complaints: Array<{
    id: string;
    name: string;
    email: string;
    type: string;
    resourceSlug: string | null;
    subject: string;
    message: string;
    evidenceUrl: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: string;
  }>;
  driveSync: {
    config: {
      configured: boolean;
      folderId: string | null;
      authMode: string;
      serviceAccountEmail: string | null;
    };
    shrinkMeConfigured: boolean;
    geminiConfigured: boolean;
    activeJob?: {
      running: boolean;
      startedAt: string | null;
      finishedAt: string | null;
      currentFile: string | null;
      progressText: string | null;
      filesScanned: number;
      filesImported: number;
      filesUpdated: number;
      filesSkipped: number;
      errors: string[];
    };
    logs: Array<{
      id: string;
      trigger: string;
      status: string;
      filesScanned: number;
      filesImported: number;
      filesUpdated: number;
      filesSkipped: number;
      errorMessage: string | null;
      createdAt: string;
    }>;
  };
}

const EMPTY_FORM = {
  id: "",
  title: "",
  description: "",
  shortDescription: "",
  examCategory: "SSC_CGL",
  resourceType: "NOTES",
  subject: "",
  categoryId: "",
  coverImageUrl: "",
  coverAccent: "#2563EB",
  storageType: "EXTERNAL_URL",
  protectedFileUrl: "",
  storagePath: "",
  driveFileId: "",
  sampleStoragePath: "",
  samplePageCount: "",
  adShortlinkUrl: "",
  fileFormat: "PDF",
  fileSizeLabel: "1.5 MB",
  pageCount: "",
  authorSource: "SSPH Editorial",
  author: "",
  publisher: "",
  yearPublished: "",
  language: "English",
  edition: "",
  isbn: "",
  difficulty: "intermediate",
  genreJson: "",
  subjectsJson: "",
  examRelevanceJson: "",
  tagsJson: "",
  accessType: "AD_SUPPORTED",
  isPublished: true,
  isFeatured: false,
  isDemo: false,
};

export function AdminDashboardClient({
  currentAdminId,
  stats,
  resources,
  categories,
  users,
  purchases,
  analytics,
  complaints,
  driveSync,
}: AdminProps) {
  const router = useRouter();
  const [tab, setTab] = useState<
    | "resources"
    | "drive"
    | "categories"
    | "users"
    | "purchases"
    | "analytics"
    | "complaints"
  >("resources");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    categoryId: categories[0]?.id || "",
  });
  const [savingResource, setSavingResource] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [generatingShortlink, setGeneratingShortlink] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [syncingDrive, setSyncingDrive] = useState(
    Boolean(driveSync.activeJob?.running)
  );
  const [activeJob, setActiveJob] = useState(driveSync.activeJob ?? null);
  const [autoPublishDrive, setAutoPublishDrive] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

  useEffect(() => {
    if (!syncingDrive) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/drive-sync", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          activeJob?: NonNullable<AdminProps["driveSync"]["activeJob"]>;
        };
        if (data.activeJob) {
          setActiveJob(data.activeJob);
          if (!data.activeJob.running) {
            setSyncingDrive(false);
            setFeedback({
              type: data.activeJob.errors.length > 0 ? "err" : "ok",
              msg: `${data.activeJob.progressText || "Drive sync finished."}${
                data.activeJob.errors.length > 0
                  ? ` Notes: ${data.activeJob.errors.join("; ")}`
                  : ""
              }`,
            });
            router.refresh();
          }
        }
      } catch {
        // Retry quietly
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [syncingDrive, router]);

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  function openNewResourceForm() {
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id || "",
    });
    setFeedback(null);
    setFormOpen(true);
  }

  function openNewRoadmapForm() {
    const roadmapCat = categories.find((c) =>
      c.name.toLowerCase().includes("roadmap")
    );
    setForm({
      ...EMPTY_FORM,
      resourceType: "ROADMAP",
      accessType: "FREE",
      adShortlinkUrl: "",
      subject: "Study Roadmap",
      categoryId: roadmapCat?.id || categories[0]?.id || "",
      authorSource: "SSCSTUDYPREPHUB (SSPH) Editorial",
      isPublished: true,
      isFeatured: true,
    });
    setFeedback(null);
    setFormOpen(true);
  }

  function openNewSyllabusForm() {
    const syllabusCat = categories.find(
      (c) => c.slug === "syllabus" || c.name.toLowerCase().includes("syllabus")
    );
    setForm({
      ...EMPTY_FORM,
      resourceType: "NOTES",
      accessType: "FREE",
      adShortlinkUrl: "",
      subject: "SSC Exam Syllabus",
      categoryId: syllabusCat?.id || categories[0]?.id || "",
      authorSource: "SSCSTUDYPREPHUB (SSPH) Editorial",
      isPublished: true,
      isFeatured: true,
    });
    setFeedback(null);
    setFormOpen(true);
  }

  function openEditResourceForm(r: AdminProps["resources"][number]) {
    setForm({
      id: r.id,
      title: r.title,
      description: r.description,
      shortDescription: r.shortDescription || "",
      examCategory: r.examCategory,
      resourceType: r.resourceType,
      subject: r.subject,
      categoryId: r.categoryId,
      coverImageUrl: r.coverImageUrl || "",
      coverAccent: r.coverAccent || "#2563EB",
      storageType: r.storageType,
      protectedFileUrl: r.protectedFileUrl || "",
      storagePath: r.storagePath || "",
      driveFileId: r.driveFileId || "",
      sampleStoragePath: r.sampleStoragePath || "",
      samplePageCount: r.samplePageCount ? String(r.samplePageCount) : "",
      adShortlinkUrl: r.adShortlinkUrl || "",
      fileFormat: r.fileFormat,
      fileSizeLabel: r.fileSizeLabel,
      pageCount: r.pageCount ? String(r.pageCount) : "",
      authorSource: r.authorSource,
      author: r.author || "",
      publisher: r.publisher || "",
      yearPublished: r.yearPublished ? String(r.yearPublished) : "",
      language: r.language || "English",
      edition: r.edition || "",
      isbn: r.isbn || "",
      difficulty: r.difficulty || "intermediate",
      genreJson: r.genreJson || "",
      subjectsJson: r.subjectsJson || "",
      examRelevanceJson: r.examRelevanceJson || "",
      tagsJson: r.tagsJson || "",
      accessType: r.accessType,
      isPublished: r.isPublished,
      isFeatured: r.isFeatured,
      isDemo: r.isDemo,
    });
    setFeedback(null);
    setFormOpen(true);
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    setFeedback(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slugHint", form.title || "resource");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as {
        storageType?: string;
        storagePath?: string;
        fileSizeLabel?: string;
        totalPages?: number | null;
        samplePageCount?: number | null;
        sampleStoragePath?: string | null;
        thumbnailUrl?: string | null;
        error?: string;
      };
      if (!res.ok || !data.storagePath) {
        setFeedback({ type: "err", msg: data.error || "PDF upload failed." });
        return;
      }
      setForm((prev) => ({
        ...prev,
        storageType: data.storageType || "LOCAL_DEMO_PDF",
        storagePath: data.storagePath || "",
        fileSizeLabel: data.fileSizeLabel || prev.fileSizeLabel,
        pageCount: data.totalPages ? String(data.totalPages) : prev.pageCount,
        sampleStoragePath: data.sampleStoragePath || prev.sampleStoragePath,
        samplePageCount: data.samplePageCount
          ? String(data.samplePageCount)
          : prev.samplePageCount,
        coverImageUrl: data.thumbnailUrl || prev.coverImageUrl,
      }));
      setFeedback({
        type: "ok",
        msg: `PDF uploaded (${data.storagePath})${
          data.samplePageCount
            ? ` and sliced first ${data.samplePageCount} pages as live sample preview.`
            : "."
        }`,
      });
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleGenerateSeoMetadata() {
    if (!form.title.trim()) {
      setFeedback({
        type: "err",
        msg: "Enter the book title first before fetching web SEO metadata.",
      });
      return;
    }
    setGeneratingSeo(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/metadata/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          author: form.author || form.authorSource,
          edition: form.edition,
          language: form.language || "English",
          year: form.yearPublished,
          actualPdfPages: form.pageCount ? Number(form.pageCount) : undefined,
        }),
      });
      const data = (await res.json()) as {
        metadata?: {
          title: string;
          author: string;
          publisher: string;
          yearPublished: number;
          language: string;
          edition: string;
          totalPages: number;
          isbn: string;
          difficulty: string;
          description: string;
          shortDescription: string;
          genre: string[];
          subject: string[];
          examRelevance: string[];
          tags: string[];
        };
        coverThumbnailUrl?: string | null;
        sourceMode?: string;
        error?: string;
      };
      if (!res.ok || !data.metadata) {
        setFeedback({
          type: "err",
          msg: data.error || "Could not fetch SEO metadata.",
        });
        return;
      }
      const m = data.metadata;
      setForm((prev) => ({
        ...prev,
        title: m.title || prev.title,
        description: m.description || prev.description,
        shortDescription: m.shortDescription || prev.shortDescription,
        author: m.author || prev.author,
        authorSource: m.author || prev.authorSource,
        publisher: m.publisher || prev.publisher,
        yearPublished: m.yearPublished ? String(m.yearPublished) : prev.yearPublished,
        language: m.language || prev.language,
        edition: m.edition || prev.edition,
        isbn: m.isbn || prev.isbn,
        difficulty: m.difficulty || prev.difficulty,
        pageCount: m.totalPages ? String(m.totalPages) : prev.pageCount,
        subject: m.subject[0] || prev.subject,
        coverImageUrl: prev.coverImageUrl || data.coverThumbnailUrl || "",
        genreJson: JSON.stringify(m.genre),
        subjectsJson: JSON.stringify(m.subject),
        examRelevanceJson: JSON.stringify(m.examRelevance),
        tagsJson: JSON.stringify(m.tags),
      }));
      setFeedback({
        type: "ok",
        msg: `SEO metadata fetched via ${
          data.sourceMode === "gemini_web_search"
            ? "Gemini 3.8 Flash + Web Search"
            : "Google Books & Open Library"
        }. Review and save!`,
      });
    } finally {
      setGeneratingSeo(false);
    }
  }

  async function handleDriveSyncNow() {
    setSyncingDrive(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/drive-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoPublish: autoPublishDrive,
          maxImportCount: 5,
        }),
      });
      const data = (await res.json()) as {
        started?: boolean;
        activeJob?: NonNullable<AdminProps["driveSync"]["activeJob"]>;
        error?: string;
      };
      if (!res.ok) {
        setSyncingDrive(false);
        setFeedback({ type: "err", msg: data.error || "Drive sync failed to start." });
        return;
      }
      if (data.activeJob) {
        setActiveJob(data.activeJob);
      }
      setFeedback({
        type: "ok",
        msg: "Google Drive sync started in background. Live download & preview slicing progress will appear below.",
      });
    } catch {
      setSyncingDrive(false);
      setFeedback({ type: "err", msg: "Could not start Drive sync." });
    }
  }

  async function handleBackfillThumbnails() {
    setFeedback(null);
    const res = await fetch("/api/admin/thumbnails/backfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overwrite: true }),
    });
    const data = (await res.json()) as {
      processed?: number;
      updated?: number;
      errors?: string[];
      error?: string;
    };
    if (!res.ok) {
      setFeedback({ type: "err", msg: data.error || "Thumbnail generation failed." });
      return;
    }
    setFeedback({
      type: data.errors?.length ? "err" : "ok",
      msg: `Generated Page-1 PDF thumbnails for ${data.updated ?? 0} of ${
        data.processed ?? 0
      } resources.`,
    });
    router.refresh();
  }

  async function handleRegisterDriveWebhook() {
    setFeedback(null);
    const res = await fetch("/api/admin/drive-watch", { method: "POST" });
    const data = (await res.json()) as {
      registered?: boolean;
      channelId?: string;
      error?: string;
    };
    if (!res.ok) {
      setFeedback({ type: "err", msg: data.error || "Webhook registration failed." });
      return;
    }
    setFeedback({
      type: "ok",
      msg: `Google Drive push notification channel registered (${data.channelId}).`,
    });
  }

  async function handleAutoShrinkMe() {
    if (!form.protectedFileUrl) {
      setFeedback({
        type: "err",
        msg: "Enter a source PDF URL first before generating a ShrinkMe.io shortlink.",
      });
      return;
    }
    setGeneratingShortlink(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/shrinkme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: form.protectedFileUrl }),
      });
      const data = (await res.json()) as { shortenedUrl?: string; error?: string };
      if (!res.ok || !data.shortenedUrl) {
        setFeedback({
          type: "err",
          msg: data.error || "ShrinkMe API could not generate shortlink.",
        });
        return;
      }
      setForm((prev) => ({ ...prev, adShortlinkUrl: data.shortenedUrl! }));
      setFeedback({ type: "ok", msg: "ShrinkMe.io shortlink generated." });
    } finally {
      setGeneratingShortlink(false);
    }
  }

  async function handleSaveResource(e: React.FormEvent) {
    e.preventDefault();
    setSavingResource(true);
    setFeedback(null);

    const payload = {
      title: form.title,
      description: form.description,
      shortDescription: form.shortDescription || null,
      examCategory: form.examCategory,
      resourceType: form.resourceType,
      subject: form.subject,
      categoryId: form.categoryId,
      coverImageUrl: form.coverImageUrl || null,
      coverAccent: form.coverAccent,
      storageType: form.storageType,
      protectedFileUrl: form.protectedFileUrl || null,
      storagePath: form.storagePath || null,
      driveFileId: form.driveFileId || null,
      sampleStoragePath: form.sampleStoragePath || null,
      samplePageCount: form.samplePageCount ? Number(form.samplePageCount) : null,
      adShortlinkUrl: form.adShortlinkUrl || null,
      fileFormat: form.fileFormat,
      fileSizeLabel: form.fileSizeLabel,
      pageCount: form.pageCount ? Number(form.pageCount) : null,
      authorSource: form.authorSource,
      author: form.author || null,
      publisher: form.publisher || null,
      yearPublished: form.yearPublished ? Number(form.yearPublished) : null,
      language: form.language || "English",
      edition: form.edition || null,
      isbn: form.isbn || null,
      difficulty: form.difficulty || "intermediate",
      genreJson: form.genreJson || null,
      subjectsJson: form.subjectsJson || null,
      examRelevanceJson: form.examRelevanceJson || null,
      tagsJson: form.tagsJson || null,
      accessType: form.accessType,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      isDemo: form.isDemo,
    };

    try {
      const url = form.id
        ? `/api/admin/resources/${form.id}`
        : "/api/admin/resources";
      const res = await fetch(url, {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFeedback({ type: "err", msg: data.error || "Save failed." });
        return;
      }
      setFormOpen(false);
      setFeedback({
        type: "ok",
        msg: form.id ? "Resource updated." : "Resource created successfully.",
      });
      router.refresh();
    } finally {
      setSavingResource(false);
    }
  }

  async function toggleResourceField(
    id: string,
    patch: { isPublished?: boolean; isFeatured?: boolean }
  ) {
    await fetch(`/api/admin/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  async function deleteResource(id: string) {
    if (!confirm("Delete this resource permanently?")) return;
    await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setSavingCat(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          slug: catSlug,
          description: catDesc,
          sortOrder: categories.length + 1,
          isActive: true,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFeedback({ type: "err", msg: data.error || "Could not add category." });
        return;
      }
      setCatName("");
      setCatSlug("");
      setCatDesc("");
      router.refresh();
    } finally {
      setSavingCat(false);
    }
  }

  async function toggleUser(
    userId: string,
    patch: { role?: string; isActive?: boolean }
  ) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setFeedback({ type: "err", msg: data.error || "User update failed." });
      return;
    }
    router.refresh();
  }

  async function updateComplaint(
    id: string,
    status: string,
    unpublishLinkedResource = false
  ) {
    await fetch(`/api/admin/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, unpublishLinkedResource }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge tone="navy">
            <ShieldCheck className="h-3.5 w-3.5" />
            Administrator Control Center
          </Badge>
          <h1 className="mt-2 text-2xl font-extrabold text-[#101B33] sm:text-3xl">
            SSPH Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage study resources, ShrinkMe.io / protected storage links, categories,
            users, Razorpay revenue, and copyright takedowns.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button onClick={openNewSyllabusForm} variant="outline" size="lg">
            <Plus className="h-4 w-4 text-[#2563EB]" />
            Add Free Syllabus
          </Button>
          <Button onClick={openNewRoadmapForm} variant="outline" size="lg">
            <Plus className="h-4 w-4 text-emerald-600" />
            Add Free Roadmap
          </Button>
          <Button onClick={openNewResourceForm} size="lg">
            <Plus className="h-4 w-4" />
            Add New Resource
          </Button>
        </div>
      </div>

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>Total Resources</span>
            <BookOpen className="h-4 w-4 text-[#2563EB]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101B33]">
            {stats.totalResources}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-[#2563EB]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101B33]">
            {stats.totalUsers}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>Paid / Premium</span>
            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101B33]">
            {stats.premiumUsers}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>Total Downloads</span>
            <Download className="h-4 w-4 text-[#2563EB]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101B33]">
            {stats.totalDownloads.toLocaleString()}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>Total Revenue</span>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101B33]">
            ₹{stats.totalRevenueInr.toLocaleString()}
          </p>
        </Card>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-xs font-semibold ${
            feedback.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Add/Edit Resource Drawer Card */}
      {formOpen && (
        <Card className="border-[#2563EB] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <h2 className="text-lg font-bold text-[#101B33]">
              {form.id ? "Edit Study Resource" : "Publish New Study Resource"}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGenerateSeoMetadata}
                disabled={generatingSeo}
              >
                {generatingSeo ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {generatingSeo ? "Fetching Web & SEO..." : "Auto-Fetch Web & SEO Metadata"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>

          <form onSubmit={handleSaveResource} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Resource Title *</label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. SSC CGL Trigonometry Formula Handbook"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Subject *</label>
              <Input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Mathematics"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold">Description *</label>
              <Textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Clear description of syllabus coverage and contents..."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Exam Category *</label>
              <Select
                value={form.examCategory}
                onChange={(e) => setForm({ ...form, examCategory: e.target.value })}
              >
                {EXAM_OPTIONS.map((ex) => (
                  <option key={ex.value} value={ex.value}>
                    {ex.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Category (16 Topics) *</label>
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Resource Type *</label>
              <Select
                value={form.resourceType}
                onChange={(e) => {
                  const nextType = e.target.value;
                  if (nextType === "ROADMAP") {
                    const roadmapCat = categories.find((c) =>
                      c.name.toLowerCase().includes("roadmap")
                    );
                    setForm({
                      ...form,
                      resourceType: nextType,
                      accessType: "FREE",
                      adShortlinkUrl: "",
                      categoryId: roadmapCat?.id || form.categoryId,
                      subject: form.subject || "Study Roadmap",
                    });
                  } else {
                    setForm({ ...form, resourceType: nextType });
                  }
                }}
              >
                {RESOURCE_TYPE_OPTIONS.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Access Type *</label>
              <Select
                value={form.resourceType === "ROADMAP" ? "FREE" : form.accessType}
                disabled={form.resourceType === "ROADMAP"}
                onChange={(e) => setForm({ ...form, accessType: e.target.value })}
              >
                {ACCESS_TYPE_OPTIONS.map((at) => (
                  <option key={at.value} value={at.value}>
                    {at.label}
                  </option>
                ))}
              </Select>
              {form.resourceType === "ROADMAP" && (
                <p className="mt-1 text-[11px] font-medium text-emerald-700">
                  Roadmaps are always completely free (no ads, direct download).
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Author / Source *</label>
              <Input
                required
                value={form.authorSource}
                onChange={(e) => setForm({ ...form, authorSource: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">File Size Label *</label>
                <Input
                  required
                  value={form.fileSizeLabel}
                  onChange={(e) => setForm({ ...form, fileSizeLabel: e.target.value })}
                  placeholder="2.4 MB"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Page Count</label>
                <Input
                  type="number"
                  min={1}
                  value={form.pageCount}
                  onChange={(e) => setForm({ ...form, pageCount: e.target.value })}
                  placeholder="48"
                />
              </div>
            </div>

            {/* PDF Upload & Protected Storage */}
            <div className="md:col-span-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#101B33]">
                Protected PDF Storage &amp; ShrinkMe.io Integration
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Upload PDF File (Local Protected / Supabase Storage)
                  </label>
                  <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#2563EB] bg-white px-3 text-xs font-semibold text-[#2563EB] hover:bg-blue-50">
                    {uploadingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    <span>{uploadingPdf ? "Uploading PDF..." : "Choose .pdf file (max 25MB)"}</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={handlePdfUpload}
                    />
                  </label>
                  {form.storagePath && (
                    <p className="mt-1 font-mono text-[11px] text-emerald-700">
                      Stored at: {form.storagePath} ({form.storageType})
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    OR External Protected PDF URL (Hidden from public)
                  </label>
                  <Input
                    value={form.protectedFileUrl}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        protectedFileUrl: e.target.value,
                        storageType: e.target.value ? "EXTERNAL_URL" : form.storageType,
                      })
                    }
                    placeholder="https://storage.example.com/private/notes.pdf"
                  />
                </div>
              </div>

              {form.resourceType === "ROADMAP" ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                  <strong>Direct Free Download Active:</strong> Roadmaps skip ShrinkMe.io
                  advertisements and unlock in 1 click for all students with zero ads or
                  fees.
                </div>
              ) : (
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold">
                      ShrinkMe.io Ad-Supported Shortlink (For Free Ad-Supported Downloads)
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoShrinkMe}
                      disabled={generatingShortlink}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {generatingShortlink
                        ? "Generating..."
                        : "Auto-shorten via ShrinkMe API"}
                    </button>
                  </div>
                  <Input
                    value={form.adShortlinkUrl}
                    onChange={(e) => setForm({ ...form, adShortlinkUrl: e.target.value })}
                    placeholder="https://shrinkme.io/your-short-code"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    When provided on an Ad-Supported resource, users complete a quick ad
                    view via ShrinkMe.io before automatic PDF download.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Cover Image URL (Optional)
              </label>
              <Input
                value={form.coverImageUrl}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                placeholder="https://... or leave blank for clean generated cover"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-4">
              <div className="sm:col-span-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#101B33]">
                  SEO Book Metadata (Auto-populated via Drive + Web Search / Gemini)
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold">
                  Short Description (Max 120 chars)
                </label>
                <Input
                  value={form.shortDescription}
                  maxLength={140}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Punchy one-line summary for SEO"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Author</label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Publisher</label>
                <Input
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Edition</label>
                <Input
                  value={form.edition}
                  onChange={(e) => setForm({ ...form, edition: e.target.value })}
                  placeholder="e.g. 5th Edition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Year Published</label>
                <Input
                  type="number"
                  value={form.yearPublished}
                  onChange={(e) => setForm({ ...form, yearPublished: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">ISBN</label>
                <Input
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Difficulty</label>
                <Select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-5">
              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Published
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.isDemo}
                  onChange={(e) => setForm({ ...form, isDemo: e.target.checked })}
                />
                Mark as DEMO
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-[#E2E8F0] pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingResource}>
                {savingResource && <Loader2 className="h-4 w-4 animate-spin" />}
                {form.id ? "Save Changes" : "Create Resource"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-3">
        {[
          { id: "resources", label: "Resources", icon: BookOpen },
          { id: "drive", label: "Google Drive Auto-Sync", icon: CloudCog },
          { id: "categories", label: "Categories", icon: FolderKanban },
          { id: "users", label: "Users", icon: Users },
          { id: "purchases", label: "Purchases & Revenue", icon: CreditCard },
          { id: "analytics", label: "Download & Ad Analytics", icon: BarChart3 },
          { id: "complaints", label: "Complaints & DMCA", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as typeof tab)}
              className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold cursor-pointer transition-colors ${
                active
                  ? "bg-[#101B33] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#172033] hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* GOOGLE DRIVE AUTO-SYNC TAB */}
      {tab === "drive" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#101B33]">
                  Google Drive Folder Sync &amp; Automatic Pipeline
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Runs in the background using resilient 24 MB chunked downloads (supports
                  large PDFs up to 1 GB, smallest files first), slices the first 10–15
                  pages as a sample preview, and enriches SEO metadata. Books receive
                  ShrinkMe.io ad-supported links, while PDFs inside a{" "}
                  <strong>Roadmaps</strong> subfolder (or with{" "}
                  <strong>roadmap / study plan</strong> in their filename) are imported as{" "}
                  <strong>100% Free Direct-Download Roadmaps (zero ads)</strong>.
                </p>
                <label className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#172033]">
                  <input
                    type="checkbox"
                    checked={autoPublishDrive}
                    onChange={(e) => setAutoPublishDrive(e.target.checked)}
                  />
                  <span>
                    I confirm I own or have legal permission to distribute these Drive
                    PDFs (publish immediately; otherwise import as Draft for review)
                  </span>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleDriveSyncNow}
                  disabled={syncingDrive}
                >
                  {syncingDrive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {syncingDrive ? "Syncing Drive..." : "Sync Google Drive Now"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRegisterDriveWebhook}
                >
                  Register Push Webhook
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackfillThumbnails}
                >
                  Generate Page-1 Thumbnails
                </Button>
              </div>
            </div>

            {activeJob?.running && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#101B33]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                  <span>{activeJob.progressText || "Syncing Google Drive..."}</span>
                </div>
                <p className="mt-1.5 text-slate-600">
                  Scanned: {activeJob.filesScanned} • Imported: {activeJob.filesImported}{" "}
                  • Updated: {activeJob.filesUpdated} • Skipped: {activeJob.filesSkipped}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <p className="text-slate-500 font-semibold">Google Drive Status</p>
                <p className="mt-1 font-bold text-[#101B33]">
                  {driveSync.config.configured
                    ? `Connected (${driveSync.config.authMode})`
                    : "Awaiting Credentials"}
                </p>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <p className="text-slate-500 font-semibold">Folder ID</p>
                <p className="mt-1 font-mono truncate text-[#101B33]">
                  {driveSync.config.folderId || "Not set in .env"}
                </p>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <p className="text-slate-500 font-semibold">ShrinkMe.io API</p>
                <p className="mt-1 font-bold text-[#101B33]">
                  {driveSync.shrinkMeConfigured ? "Configured (Auto-Shrink Active)" : "Not Set"}
                </p>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <p className="text-slate-500 font-semibold">Gemini 3.8 Flash SEO</p>
                <p className="mt-1 font-bold text-[#101B33]">
                  {driveSync.geminiConfigured
                    ? "Active (Web Grounding)"
                    : "Free Web Fallback (Google Books + OpenLibrary)"}
                </p>
              </div>
            </div>

            {driveSync.config.serviceAccountEmail && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-[#101B33]">
                Share your Google Drive folder with Service Account:{" "}
                <code className="font-mono font-bold">
                  {driveSync.config.serviceAccountEmail}
                </code>{" "}
                (Viewer access). Scheduled auto-sync endpoint:{" "}
                <code className="font-mono">/api/cron/drive-sync</code>
              </div>
            )}
          </Card>

          <Card className="p-6 overflow-x-auto">
            <h3 className="text-base font-bold text-[#101B33]">Recent Sync History</h3>
            {driveSync.logs.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                No Google Drive sync runs recorded yet.
              </p>
            ) : (
              <table className="mt-4 w-full text-left text-xs">
                <thead className="border-b border-[#E2E8F0] uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Trigger</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Scanned</th>
                    <th className="py-2 pr-4">Imported</th>
                    <th className="py-2 pr-4">Updated</th>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {driveSync.logs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 pr-4 font-semibold">{log.trigger}</td>
                      <td className="py-2.5 pr-4">
                        <Badge tone={log.status === "SUCCESS" ? "green" : "amber"}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 font-mono">{log.filesScanned}</td>
                      <td className="py-2.5 pr-4 font-mono">{log.filesImported}</td>
                      <td className="py-2.5 pr-4 font-mono">{log.filesUpdated}</td>
                      <td className="py-2.5 pr-4 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-red-600 max-w-xs truncate">
                        {log.errorMessage || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* RESOURCES TAB */}
      {tab === "resources" && (
        <Card className="p-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 pr-4">Title</th>
                <th className="py-2.5 pr-4">Exam / Category</th>
                <th className="py-2.5 pr-4">Access</th>
                <th className="py-2.5 pr-4">Downloads</th>
                <th className="py-2.5 pr-4">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {resources.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/resources/${r.slug}`}
                      className="font-bold text-[#101B33] hover:text-[#2563EB]"
                    >
                      {r.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {r.fileSizeLabel} • {r.adShortlinkUrl ? "ShrinkMe Linked" : r.storageType}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-xs">
                    <div className="font-semibold text-[#172033]">
                      {formatExamLabel(r.examCategory)}
                    </div>
                    <div className="text-slate-500">{r.category.name}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      tone={
                        r.accessType === "FREE"
                          ? "green"
                          : r.accessType === "AD_SUPPORTED"
                            ? "blue"
                            : "navy"
                      }
                    >
                      {r.accessType}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{r.downloadCount}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          toggleResourceField(r.id, { isPublished: !r.isPublished })
                        }
                        className="cursor-pointer"
                      >
                        <Badge tone={r.isPublished ? "green" : "amber"}>
                          {r.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleResourceField(r.id, { isFeatured: !r.isFeatured })
                        }
                        className="cursor-pointer"
                      >
                        <Badge tone={r.isFeatured ? "blue" : "slate"}>
                          {r.isFeatured ? "Featured" : "Standard"}
                        </Badge>
                      </button>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditResourceForm(r)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteResource(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* CATEGORIES TAB */}
      {tab === "categories" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <h2 className="text-base font-bold text-[#101B33]">Add Category</h2>
            <form onSubmit={handleAddCategory} className="mt-4 space-y-3">
              <Input
                required
                placeholder="Category Name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
              <Input
                required
                placeholder="slug-name"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
              />
              <Textarea
                required
                placeholder="Description"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
              />
              <Button type="submit" disabled={savingCat} className="w-full">
                Add Category
              </Button>
            </form>
          </Card>

          <Card className="p-6 lg:col-span-2 overflow-x-auto">
            <h2 className="text-base font-bold text-[#101B33]">All Categories</h2>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="border-b border-[#E2E8F0] text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Resources</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="py-2.5 pr-4 font-semibold text-[#101B33]">
                      {cat.name}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">
                      {cat.slug}
                    </td>
                    <td className="py-2.5 pr-4 text-xs">{cat._count.resources}</td>
                    <td className="py-2.5">
                      <Badge tone={cat.isActive ? "green" : "slate"}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* USERS TAB */}
      {tab === "users" && (
        <Card className="p-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 pr-4">User</th>
                <th className="py-2.5 pr-4">Role</th>
                <th className="py-2.5 pr-4">Membership</th>
                <th className="py-2.5 pr-4">Credits</th>
                <th className="py-2.5 pr-4">Downloads</th>
                <th className="py-2.5 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-4">
                    <p className="font-bold text-[#101B33]">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={u.role === "ADMIN" ? "navy" : "slate"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold">
                    {u.membershipTier}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{u.bookCredits}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{u._count.downloads}</td>
                  <td className="py-3 text-right">
                    {u.id !== currentAdminId ? (
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleUser(u.id, {
                              role: u.role === "ADMIN" ? "STUDENT" : "ADMIN",
                            })
                          }
                        >
                          {u.role === "ADMIN" ? "Make Student" : "Make Admin"}
                        </Button>
                        <Button
                          size="sm"
                          variant={u.isActive ? "danger" : "secondary"}
                          onClick={() => toggleUser(u.id, { isActive: !u.isActive })}
                        >
                          {u.isActive ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Current Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* PURCHASES TAB */}
      {tab === "purchases" && (
        <Card className="p-5 overflow-x-auto">
          {purchases.length === 0 ? (
            <p className="text-sm text-slate-600">No Razorpay orders recorded yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E2E8F0] text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 pr-4">Student</th>
                  <th className="py-2.5 pr-4">Plan</th>
                  <th className="py-2.5 pr-4">Amount</th>
                  <th className="py-2.5 pr-4">Order ID</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-[#101B33]">{p.user.name}</p>
                      <p className="text-xs text-slate-500">{p.user.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs font-semibold">{p.planType}</td>
                    <td className="py-3 pr-4 font-bold">
                      ₹{(p.amountPaise / 100).toFixed(0)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{p.razorpayOrderId}</td>
                    <td className="py-3">
                      <Badge tone={p.status === "PAID" ? "green" : "amber"}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* ANALYTICS TAB */}
      {tab === "analytics" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-bold text-[#101B33]">
              Downloads by Unlock Method
            </h2>
            <div className="mt-4 space-y-2.5">
              {analytics.methodBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500">No download logs recorded yet.</p>
              ) : (
                analytics.methodBreakdown.map((item) => (
                  <div
                    key={item.method}
                    className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3 text-sm"
                  >
                    <span className="font-semibold text-[#101B33]">
                      {item.method.replace(/_/g, " ")}
                    </span>
                    <Badge tone="blue">{item.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-[#101B33]">
              Rewarded Ad &amp; ShrinkMe Sessions
            </h2>
            <div className="mt-4 space-y-2.5">
              {analytics.adSessionStats.length === 0 ? (
                <p className="text-sm text-slate-500">No ad sessions triggered yet.</p>
              ) : (
                analytics.adSessionStats.map((s) => (
                  <div
                    key={`${s.provider}-${s.status}`}
                    className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3 text-sm"
                  >
                    <span className="font-semibold text-[#101B33]">
                      {s.provider} • {s.status}
                    </span>
                    <Badge tone="slate">{s.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* COMPLAINTS & DMCA TAB */}
      {tab === "complaints" && (
        <Card className="p-5 space-y-4">
          {complaints.length === 0 ? (
            <p className="text-sm text-slate-600">
              No support tickets or copyright takedown requests yet.
            </p>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-[#E2E8F0] p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={c.type === "COPYRIGHT_DMCA" ? "red" : "blue"}>
                      {c.type}
                    </Badge>
                    <Badge tone={c.status === "OPEN" ? "amber" : "green"}>
                      {c.status}
                    </Badge>
                    <span className="text-sm font-bold text-[#101B33]">
                      {c.subject}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  From: {c.name} ({c.email})
                  {c.resourceSlug ? ` • Resource Slug: ${c.resourceSlug}` : ""}
                </p>
                <p className="text-sm text-[#172033]">{c.message}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateComplaint(c.id, "IN_REVIEW")}
                  >
                    Mark In Review
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateComplaint(c.id, "RESOLVED")}
                  >
                    Mark Resolved
                  </Button>
                  {c.resourceSlug && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        updateComplaint(c.id, "TAKEDOWN_APPLIED", true)
                      }
                    >
                      Apply Takedown &amp; Unpublish Resource
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
