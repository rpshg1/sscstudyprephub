import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "About SSPH",
  description:
    "Learn about SSCSTUDYPREPHUB (SSPH), an independent digital study library for SSC CGL, CHSL, MTS, CPO, and GD aspirants.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Badge tone="blue">About Us</Badge>
        <h1 className="mt-2 text-3xl font-extrabold text-[#101B33]">
          About {BRAND.name} ({BRAND.shortName})
        </h1>
        <p className="mt-2 text-base text-slate-600">{BRAND.tagline}</p>
      </div>

      <Card className="p-6 sm:p-8 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          <strong>{BRAND.name} (SSPH)</strong> is an independent digital study repository
          built to help Indian competitive exam aspirants—specifically candidates
          preparing for <strong>SSC CGL, CHSL, MTS, CPO, and GD</strong>—organize
          syllabus-aligned study notes, previous year practice sets, roadmaps, and current
          affairs digests in one distraction-free hub.
        </p>
        <p>
          Our freemium access model keeps essential preparation material accessible to
          every student at <strong>₹0</strong> via verified ad-supported unlocks, while
          offering an affordable <strong>₹59 10-Books Pass</strong> and a{" "}
          <strong>₹300 Lifetime Premium</strong> membership for instant, ad-free downloads.
        </p>
        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-xs text-[#101B33]">
          <strong>Independence Notice:</strong> {BRAND.disclaimerShort}
        </div>
        <div className="pt-2 flex flex-wrap gap-4">
          <Link href="/library" className="font-semibold text-[#2563EB] hover:underline">
            Explore the Resource Library →
          </Link>
          <Link href="/contact" className="font-semibold text-[#2563EB] hover:underline">
            Contact Support →
          </Link>
        </div>
      </Card>
    </div>
  );
}
