import { z } from "zod";

// --- Helpers ---------------------------------------------------------------

/** Optional HTTP(S) URL, allowing empty string from form fields. */
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/.+/i.test(v), "validation.urlInvalid")
  .transform((v) => (v ? v : undefined));

/** Optional short label for the public link button, allowing empty string. */
const optionalUrlLabel = z
  .string()
  .trim()
  .max(60, "validation.urlLabelMax")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "validation.emailInvalid")
  .transform((v) => (v ? v : undefined));

// --- Auth ------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().email("validation.emailInvalid"),
  password: z.string().min(8, "validation.passwordMin"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// --- Contact form ----------------------------------------------------------

export const inquiryTypes = ["JOB_OR_INTERNSHIP", "FREELANCE_PROJECT", "COLLABORATION", "OTHER"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "validation.nameMin").max(80),
  email: z.string().trim().email("validation.emailInvalid").max(160),
  inquiryType: z.enum(inquiryTypes),
  subject: z.string().trim().min(2, "validation.subjectMin").max(160),
  message: z.string().trim().min(10, "validation.messageMin").max(5000),
  /** honeypot — must remain empty */
  company: z.string().max(0, "validation.spam").optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactSchema>;

// --- Projects --------------------------------------------------------------

export const projectStatuses = ["DRAFT", "PUBLISHED", "UNPUBLISHED"] as const;

export const projectSchema = z.object({
  title: z.string().trim().min(1, "validation.titleRequired").max(120),
  slug: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => (v ? v.trim() : undefined)),
  shortDescription: z.string().trim().max(280).optional().or(z.literal("")).transform((v) => v || undefined),
  description: z.string().trim().optional().transform((v) => v || undefined),
  category: z.string().trim().max(80).optional().or(z.literal("")).transform((v) => v || undefined),
  role: z.string().trim().max(120).optional().or(z.literal("")).transform((v) => v || undefined),
  overview: z.string().trim().optional().transform((v) => v || undefined),
  problem: z.string().trim().optional().transform((v) => v || undefined),
  targetUsers: z.string().trim().optional().transform((v) => v || undefined),
  goals: z.string().trim().optional().transform((v) => v || undefined),
  architecture: z.string().trim().optional().transform((v) => v || undefined),
  challenges: z.string().trim().optional().transform((v) => v || undefined),
  testingNotes: z.string().trim().optional().transform((v) => v || undefined),
  futureImprovements: z.string().trim().optional().transform((v) => v || undefined),
  technologies: z.array(z.string().trim().min(1)).max(40).default([]),
  features: z.array(z.string().trim().min(1)).max(60).default([]),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  status: z.enum(projectStatuses).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  thumbnailMediaId: z.string().optional().nullable(),
  screenshotIds: z.array(z.string()).default([]),
});
export type ProjectInput = z.infer<typeof projectSchema>;

// --- Skills ----------------------------------------------------------------

export const skillSchema = z.object({
  name: z.string().trim().min(1, "validation.nameRequired").max(80),
  category: z.string().trim().min(1, "validation.categoryRequired").max(80),
  icon: z.string().trim().min(1).max(80).default("Code2"),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
  url: optionalUrl,
  urlLabel: optionalUrlLabel,
});
export type SkillInput = z.infer<typeof skillSchema>;

// --- Experience / Education ------------------------------------------------

export const experienceKinds = [
  "EDUCATION",
  "INTERNSHIP",
  "EMPLOYMENT",
  "CERTIFICATION",
  "TRAINING",
  "ACADEMIC_PROJECT",
  "ACHIEVEMENT",
] as const;

export const experienceSchema = z.object({
  kind: z.enum(experienceKinds),
  title: z.string().trim().min(1, "validation.titleRequired").max(160),
  organization: z.string().trim().max(160).optional().or(z.literal("")).transform((v) => v || undefined),
  description: z.string().trim().optional().transform((v) => v || undefined),
  startDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  endDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  current: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
  url: optionalUrl,
  urlLabel: optionalUrlLabel,
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

// --- Services --------------------------------------------------------------

export const serviceSchema = z.object({
  title: z.string().trim().min(1, "validation.titleRequired").max(120),
  description: z.string().trim().optional().transform((v) => (v ? v : undefined)),
  icon: z.string().trim().min(1).max(80).default("Code"),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
  url: optionalUrl,
  urlLabel: optionalUrlLabel,
});
export type ServiceInput = z.infer<typeof serviceSchema>;

// --- Statistics --------------------------------------------------------------

export const statisticSchema = z.object({
  value: z.string().trim().min(1, "validation.valueRequired").max(20),
  title: z.string().trim().min(1, "validation.titleRequired").max(120),
  description: z.string().trim().max(300).optional().or(z.literal("")).transform((v) => v || undefined),
  accentColor: z.string().trim().max(40).default("blue"),
  icon: z.string().trim().min(1).max(80).default("TrendingUp"),
  published: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(9999).default(0),
});
export type StatisticInput = z.infer<typeof statisticSchema>;

// --- Profile ---------------------------------------------------------------

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80).default("Mukti"),
  title: z.string().trim().max(120).optional().or(z.literal("")).transform((v) => v || undefined),
  eyebrow: z.string().trim().max(120).optional().or(z.literal("")).transform((v) => v || undefined),
  heroHeadline: z.string().trim().max(200).optional().or(z.literal("")).transform((v) => v || undefined),
  heroDescription: z.string().trim().max(600).optional().or(z.literal("")).transform((v) => v || undefined),
  bio: z.string().trim().optional().transform((v) => v || undefined),
  interests: z.string().trim().optional().transform((v) => v || undefined),
  approach: z.string().trim().optional().transform((v) => v || undefined),
  learningGoals: z.string().trim().optional().transform((v) => v || undefined),
  ambitions: z.string().trim().optional().transform((v) => v || undefined),
  education: z.string().trim().optional().transform((v) => v || undefined),
  publicEmail: optionalEmail,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  otherLinks: z.record(z.string(), z.string()).optional(),
  isAvailable: z.boolean().default(true),
  aboutVisible: z.boolean().default(true),
  cvVisible: z.boolean().default(false),
  profileImageId: z.string().optional().nullable(),
  cvFileId: z.string().optional().nullable(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// --- Site settings ---------------------------------------------------------

export const settingsSchema = z.object({
  siteTitle: z.string().trim().min(1).max(120).default("Mukti — Software Engineer"),
  metaDescription: z.string().trim().max(300).optional().or(z.literal("")).transform((v) => v || undefined),
  favicon: z.string().trim().max(200).optional().or(z.literal("")).transform((v) => v || undefined),
  footerContent: z.string().trim().optional().transform((v) => v || undefined),
  socialLinks: z.record(z.string(), z.string()).optional(),
  contactEmail: optionalEmail,
  themeAccent: z.string().trim().max(40).default("blue"),
  cvVisible: z.boolean().default(false),
  socialImageId: z.string().optional().nullable(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

// --- Messages (admin reply) ------------------------------------------------

export const replySchema = z.object({
  id: z.string().min(1),
  adminReply: z.string().trim().max(5000).optional().or(z.literal("")).transform((v) => v || undefined),
});
export type ReplyInput = z.infer<typeof replySchema>;
