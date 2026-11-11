import { z } from "zod";

export const ExamCategoryEnum = z.enum([
  "SSC_CGL",
  "SSC_CHSL",
  "SSC_MTS",
  "SSC_CPO",
  "SSC_GD",
  "ALL_SSC",
]);

export const ResourceTypeEnum = z.enum([
  "BOOK",
  "NOTES",
  "PYQ",
  "ROADMAP",
  "CURRENT_AFFAIRS",
  "PRACTICE_SET",
]);

export const AccessTypeEnum = z.enum(["FREE", "AD_SUPPORTED", "PREMIUM"]);

export const StorageTypeEnum = z.enum([
  "LOCAL_DEMO_PDF",
  "EXTERNAL_URL",
  "SUPABASE_STORAGE",
  "GOOGLE_DRIVE",
]);

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number"),
  targetExam: ExamCategoryEnum.default("SSC_CGL"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16, "Invalid reset token"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number"),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  targetExam: ExamCategoryEnum,
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^$|^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number"),
});

const safeOptionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v === "" ? null : v))
  .refine(
    (v) => v === null || v === undefined || /^https?:\/\/.+/i.test(v) || v.startsWith("/"),
    "Must be a valid http(s) URL or relative path"
  );

export const adminResourceSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(160),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  examCategory: ExamCategoryEnum,
  resourceType: ResourceTypeEnum,
  subject: z.string().trim().min(2, "Subject is required").max(80),
  categoryId: z.string().min(1, "Category is required"),
  coverImageUrl: safeOptionalUrl,
  coverAccent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color")
    .default("#2563EB"),
  storageType: StorageTypeEnum.default("EXTERNAL_URL"),
  protectedFileUrl: safeOptionalUrl,
  storagePath: z.string().trim().max(300).optional().nullable(),
  driveFileId: z.string().trim().max(200).optional().nullable(),
  sampleStoragePath: z.string().trim().max(300).optional().nullable(),
  samplePageCount: z.coerce.number().int().min(0).max(30).optional().nullable(),
  adShortlinkUrl: safeOptionalUrl,
  fileFormat: z.string().trim().min(2).max(16).default("PDF"),
  fileSizeLabel: z.string().trim().min(1).max(32).default("1.5 MB"),
  pageCount: z.coerce.number().int().min(1).max(5000).optional().nullable(),
  authorSource: z.string().trim().min(2).max(120).default("SSPH Editorial"),
  shortDescription: z.string().trim().max(200).optional().nullable(),
  author: z.string().trim().max(120).optional().nullable(),
  publisher: z.string().trim().max(120).optional().nullable(),
  yearPublished: z.coerce.number().int().min(0).max(2100).optional().nullable(),
  language: z.string().trim().max(40).optional().default("English"),
  edition: z.string().trim().max(80).optional().nullable(),
  isbn: z.string().trim().max(40).optional().nullable(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate"),
  genreJson: z.string().optional().nullable(),
  subjectsJson: z.string().optional().nullable(),
  examRelevanceJson: z.string().optional().nullable(),
  tagsJson: z.string().optional().nullable(),
  seoMetadataJson: z.string().optional().nullable(),
  accessType: AccessTypeEnum.default("AD_SUPPORTED"),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isDemo: z.boolean().default(false),
});

export const adminCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().trim().min(5).max(300),
  iconName: z.string().trim().min(2).max(40).default("BookOpen"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export const createOrderSchema = z.object({
  planType: z.enum(["TEN_BOOKS", "LIFETIME"]),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(5),
  razorpay_payment_id: z.string().min(5),
  razorpay_signature: z.string().min(10),
});

export const complaintSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  type: z.enum(["COPYRIGHT_DMCA", "CONTENT_ERROR", "PAYMENT_SUPPORT", "GENERAL"]),
  resourceSlug: z.string().trim().max(140).optional().nullable(),
  subject: z.string().trim().min(4).max(150),
  message: z.string().trim().min(15).max(3000),
  evidenceUrl: safeOptionalUrl,
});

export const adminComplaintUpdateSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "TAKEDOWN_APPLIED"]),
  adminNotes: z.string().trim().max(1000).optional().nullable(),
  unpublishLinkedResource: z.boolean().optional(),
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});
