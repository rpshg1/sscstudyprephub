import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/thumbnails/", "/api/resources/*/sample"],
        disallow: [
          "/admin",
          "/dashboard",
          "/api/admin/",
          "/api/auth/",
          "/api/download/",
          "/api/payments/",
          "/api/ads/",
          "/api/user/",
          "/api/cron/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
