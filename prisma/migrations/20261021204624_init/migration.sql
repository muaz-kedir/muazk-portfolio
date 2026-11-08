-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('JOB_OR_INTERNSHIP', 'FREELANCE_PROJECT', 'COLLABORATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceKind" AS ENUM ('EDUCATION', 'INTERNSHIP', 'EMPLOYMENT', 'CERTIFICATION', 'TRAINING', 'ACADEMIC_PROJECT', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('PROFILE', 'PROJECT_THUMBNAIL', 'PROJECT_SCREENSHOT', 'CV', 'SOCIAL', 'MISC');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "MediaCategory" NOT NULL DEFAULT 'MISC',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Mukti',
    "title" TEXT NOT NULL DEFAULT 'Software Engineer | Full-Stack Developer',
    "eyebrow" TEXT NOT NULL DEFAULT 'SOFTWARE ENGINEER & DEVELOPER',
    "heroHeadline" TEXT NOT NULL DEFAULT 'Building Digital Products That Solve Real Problems.',
    "heroDescription" TEXT NOT NULL DEFAULT 'I develop thoughtful web and mobile applications by combining clean engineering, practical architecture, and user-centered design.',
    "bio" TEXT,
    "interests" TEXT,
    "approach" TEXT,
    "learningGoals" TEXT,
    "ambitions" TEXT,
    "education" TEXT,
    "publicEmail" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "otherLinks" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "aboutVisible" BOOLEAN NOT NULL DEFAULT true,
    "profileImageId" TEXT,
    "cvFileId" TEXT,
    "cvVisible" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "category" TEXT,
    "role" TEXT,
    "technologies" TEXT[],
    "features" TEXT[],
    "overview" TEXT,
    "problem" TEXT,
    "targetUsers" TEXT,
    "goals" TEXT,
    "architecture" TEXT,
    "challenges" TEXT,
    "testingNotes" TEXT,
    "futureImprovements" TEXT,
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "thumbnailMediaId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectScreenshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,

    CONSTRAINT "ProjectScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Code2',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "kind" "ExperienceKind" NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'Code',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inquiryType" "InquiryType" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "adminReply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteTitle" TEXT NOT NULL DEFAULT 'Mukti — Software Engineer',
    "metaDescription" TEXT,
    "favicon" TEXT,
    "footerContent" TEXT,
    "socialLinks" JSONB,
    "contactEmail" TEXT,
    "themeAccent" TEXT NOT NULL DEFAULT 'blue',
    "cvVisible" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "socialImageId" TEXT,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_displayOrder_idx" ON "Project"("status", "displayOrder");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "ProjectScreenshot_projectId_idx" ON "ProjectScreenshot"("projectId");

-- CreateIndex
CREATE INDEX "Experience_kind_displayOrder_idx" ON "Experience"("kind", "displayOrder");

-- CreateIndex
CREATE INDEX "ContactMessage_isRead_isArchived_idx" ON "ContactMessage"("isRead", "isArchived");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_cvFileId_fkey" FOREIGN KEY ("cvFileId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_thumbnailMediaId_fkey" FOREIGN KEY ("thumbnailMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectScreenshot" ADD CONSTRAINT "ProjectScreenshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectScreenshot" ADD CONSTRAINT "ProjectScreenshot_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_socialImageId_fkey" FOREIGN KEY ("socialImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
