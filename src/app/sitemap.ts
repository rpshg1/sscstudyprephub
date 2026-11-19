import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTIONS_ENABLED } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://sscstudyprephub-rpqv.vercel.app");

  const now = new Date();

  // Core Landing & Section Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/roadmaps`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pyqs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/syllabus`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/typing`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/typing/exam`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...(SUBSCRIPTIONS_ENABLED
      ? [
          {
            url: `${baseUrl}/pricing`,
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.7,
          },
          {
            url: `${baseUrl}/refund-policy`,
            lastModified: now,
            changeFrequency: "yearly" as const,
            priority: 0.5,
          },
        ]
      : []),
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/copyright-dmca`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // 365+ Progressive Touch Typing Lessons
  const typingLessonRoutes: MetadataRoute.Sitemap = Array.from(
    { length: 365 },
    (_, i) => ({
      url: `${baseUrl}/typing/${i + 1}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: i < 50 ? 0.85 : 0.8,
    })
  );

  // Dynamic Resource Book & Notes Pages
  const resources = await prisma.resource.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const resourceRoutes: MetadataRoute.Sitemap = resources.map((r) => ({
    url: `${baseUrl}/resources/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...typingLessonRoutes, ...resourceRoutes];
}
