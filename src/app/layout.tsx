import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/constants";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://sscstudyprephub-rpqv.vercel.app");

function parseGoogleVerification(raw?: string): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/content=["']([^"']+)["']/i);
  if (match) return match[1].trim();
  return raw.replace(/^["']|["']$/g, "").trim();
}

const googleVerification = parseGoogleVerification(
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()
);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.name} (${BRAND.shortName}) — ${BRAND.tagline}`,
    template: `%s | ${BRAND.shortName} — ${BRAND.name}`,
  },
  description: `${BRAND.heroSubtitle} Access 365+ Touch Typing lessons, official SSC CGL/CHSL DEST typing simulators, solved PYQs, syllabus breakdowns, and free study books.`,
  keywords: [
    "SSC CGL notes PDF free download",
    "SSC CHSL study material PDF",
    "SSC MTS PYQ solved papers",
    "SSC CGL typing test online practice 2000 keystrokes",
    "SSC CHSL typing test 35 WPM English",
    "SSC DEST typing test simulator software",
    "touch typing course from scratch 365 chapters",
    "home row touch typing practice free",
    "SSC preparation roadmap 90 days study plan",
    "SSC GD current affairs PDF",
    "SSC maths formula book PDF download",
    "SSC English vocabulary blackbook PDF",
    "SSC CPO previous year papers",
    "SSC syllabus 2025 2026 Tier 1 Tier 2",
    "SSCSTUDYPREPHUB",
    "SSPH",
  ],
  authors: [{ name: "SSCSTUDYPREPHUB Academic Team", url: siteUrl }],
  creator: "SSCSTUDYPREPHUB",
  publisher: "SSCSTUDYPREPHUB",
  category: "education",
  classification: "Educational Platform & Government Exam Preparation",
  verification: googleVerification ? { google: googleVerification } : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BRAND.name,
    title: `${BRAND.name} (${BRAND.shortName}) — ${BRAND.heroHeading}`,
    description: `${BRAND.heroSubtitle} Complete SSC CGL, CHSL, MTS, CPO preparation library with 365+ Touch Typing course & DEST simulator.`,
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${BRAND.name} (${BRAND.shortName}) — ${BRAND.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} (${BRAND.shortName}) — ${BRAND.heroHeading}`,
    description: BRAND.heroSubtitle,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ssph-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#172033]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
