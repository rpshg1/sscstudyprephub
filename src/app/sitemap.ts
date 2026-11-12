import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTIONS_ENABLED } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";

  const staticRoutes = [
    "",
    "/books",
    "/roadmaps",
    "/pyqs",
    "/syllabus",
    ...(SUBSCRIPTIONS_ENABLED ? ["/pricing", "/refund-policy"] : []),
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/copyright-dmca",
    "/disclaimer",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority:
      route === ""
        ? 1.0
        : route === "/books" ||
            route === "/roadmaps" ||
            route === "/pyqs" ||
            route === "/syllabus"
          ? 0.9
          : 0.7,
  }));

  const resources = await prisma.resource.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const resourceRoutes = resources.map((r) => ({
    url: `${baseUrl}/resources/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...resourceRoutes];
}
