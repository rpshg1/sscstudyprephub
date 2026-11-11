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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.name} (${BRAND.shortName}) — ${BRAND.tagline}`,
    template: `%s | ${BRAND.shortName} — ${BRAND.name}`,
  },
  description: BRAND.heroSubtitle,
  keywords: [
    "SSC CGL notes PDF",
    "SSC CHSL study material",
    "SSC MTS PYQ",
    "SSC CPO preparation roadmap",
    "SSC GD current affairs PDF",
    "SSC maths PDF download",
    "SSC English vocabulary PDF",
    "SSCSTUDYPREPHUB",
    "SSPH",
  ],
  verification: googleVerification ? { google: googleVerification } : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BRAND.name,
    title: `${BRAND.name} (${BRAND.shortName}) — ${BRAND.heroHeading}`,
    description: BRAND.heroSubtitle,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} (${BRAND.shortName}) — ${BRAND.heroHeading}`,
    description: BRAND.heroSubtitle,
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
      className={`${plusJakarta.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#172033]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
