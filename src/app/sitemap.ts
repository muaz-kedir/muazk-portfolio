import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/projects"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/contact"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await getPublishedProjects();
    projectRoutes = projects.map((p) => ({
      url: `${base.replace(/\/$/, "")}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // If the database is not available, still serve the static routes.
  }

  return [...staticRoutes, ...projectRoutes];
}
