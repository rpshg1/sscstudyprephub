import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://sscstudyprephub-rpqv.vercel.app");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/favicon.ico",
          "/icon-*.png",
          "/logo.png",
          "/apple-touch-icon.png",
          "/og-image.png",
          "/manifest.webmanifest",
          "/api/thumbnails/",
          "/api/resources/*/sample",
        ],
        disallow: [
          "/admin",
          "/dashboard",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/api/admin/",
          "/api/auth/",
          "/api/download/",
          "/api/payments/",
          "/api/ads/",
          "/api/user/",
          "/api/cron/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/thumbnails/", "/api/resources/*/sample"],
        disallow: [
          "/admin",
          "/dashboard",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/api/admin/",
          "/api/auth/",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/",
          "/favicon.ico",
          "/icon-*.png",
          "/logo.png",
          "/og-image.png",
          "/api/thumbnails/",
        ],
      },
      {
        userAgent: "Googlebot-Favicon",
        allow: ["/", "/favicon.ico", "/icon-*.png", "/logo.png"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
