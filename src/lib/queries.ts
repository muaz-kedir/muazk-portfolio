import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "./db";
import { defaultProfile, defaultSettings } from "./defaults";
import type {
  Profile,
  Project,
  Service,
  SiteSettings,
  Skill,
  Experience,
  ProjectScreenshot,
  Media,
} from "@/generated/prisma/client";

const PROJECT_INCLUDE = {
  thumbnail: true,
} as const;

const FULL_PROJECT_INCLUDE = {
  thumbnail: true,
  screenshots: { orderBy: { displayOrder: "asc" }, include: { media: true } },
} as const;

/**
 * Public content is read through cached scopes (`"use cache"`) so it can be
 * prerendered into the static shell.
 *
 * Reading the database directly while prerendering opens a connection, and the
 * PostgreSQL SASL handshake calls `crypto.getRandomValues()`. Next.js treats
 * that as synchronous IO and aborts the prerender
 * (`https://nextjs.org/docs/messages/blocking-prerender-crypto`). Inside a
 * cache scope the call is allowed and the content is served from the cache
 * afterwards.
 *
 * Every entry is tagged. The admin server actions expire the matching tag with
 * `updateTag()` after a write, so edits show up immediately.
 */

// --- Site ------------------------------------------------------------------

export async function getProfile() {
  "use cache";
  cacheLife("hours");
  cacheTag("profile");
  try {
    const row = await prisma.profile.findFirst({
      include: { profileImage: true, cvFile: true },
    });
    return (row ?? defaultProfile) as Profile & {
      profileImage: Media | null;
      cvFile: Media | null;
    };
  } catch {
    return defaultProfile as Profile & {
      profileImage: Media | null;
      cvFile: Media | null;
    };
  }
}

export async function getSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  try {
    const row = await prisma.siteSettings.findFirst({ include: { socialImage: true } });
    return (row ?? defaultSettings) as SiteSettings & {
      socialImage: Media | null;
    };
  } catch {
    return defaultSettings as SiteSettings & {
      socialImage: Media | null;
    };
  }
}

// --- Projects (public: only PUBLISHED) -------------------------------------

export async function getPublishedProjects() {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  try {
    return await prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: PROJECT_INCLUDE,
    });
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  try {
    return await prisma.project.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: [{ displayOrder: "asc" }],
      take: limit,
      include: PROJECT_INCLUDE,
    });
  } catch {
    return [];
  }
}

export async function getPublishedProjectBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  try {
    return await prisma.project.findUnique({
      where: { slug },
      include: FULL_PROJECT_INCLUDE,
    });
  } catch {
    return null;
  }
}

export async function getRelatedProjects(slug: string, category: string | null | undefined, take = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  try {
    return await prisma.project.findMany({
      where: {
        status: "PUBLISHED",
        slug: { not: slug },
        ...(category ? { category } : {}),
      },
      orderBy: [{ displayOrder: "asc" }],
      take,
      include: PROJECT_INCLUDE,
    });
  } catch {
    return [];
  }
}

export type ProjectWithThumbnail = Project & { thumbnail: Media | null };
export type ProjectWithDetails = Project & {
  thumbnail: Media | null;
  screenshots: (ProjectScreenshot & { media: Media })[];
};

// --- Skills / Experience / Services (public: only published) ---------------

export async function getPublishedSkills() {
  "use cache";
  cacheLife("hours");
  cacheTag("skills");
  try {
    return await prisma.skill.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getPublishedExperience() {
  "use cache";
  cacheLife("hours");
  cacheTag("experience");
  try {
    return await prisma.experience.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
    });
  } catch {
    return [];
  }
}

export async function getPublishedServices() {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  try {
    return await prisma.service.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getStatistics() {
  "use cache";
  cacheLife("hours");
  cacheTag("statistics");
  try {
    return await prisma.statistic.findMany({
      where: { published: true, isVisible: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export type { Profile, Project, Service, SiteSettings, Skill, Experience, Media };
