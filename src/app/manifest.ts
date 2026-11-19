import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} (${BRAND.shortName}) — SSC Preparation Hub`,
    short_name: BRAND.shortName,
    description: BRAND.heroSubtitle,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#101B33",
    lang: "en-IN",
    categories: ["education", "books", "productivity"],
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Touch Typing Course",
        short_name: "Typing",
        description: "365+ Touch Typing Lessons & SSC DEST Simulator",
        url: "/typing",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "SSC Books",
        short_name: "Books",
        description: "Subject-wise textbooks & formula books",
        url: "/books",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Previous Year Papers",
        short_name: "PYQs",
        description: "Solved TCS shift papers",
        url: "/pyqs",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Study Roadmaps",
        short_name: "Roadmaps",
        description: "Free preparation timetables",
        url: "/roadmaps",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
