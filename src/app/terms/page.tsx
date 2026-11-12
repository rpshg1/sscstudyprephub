import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms of service for using SSCSTUDYPREPHUB (SSPH) resources and memberships.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Badge tone="slate">Legal Documentation</Badge>
        <h1 className="mt-2 text-3xl font-extrabold text-[#101B33]">
          Terms and Conditions
        </h1>
      </div>

      <Card className="p-6 sm:p-8 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          By accessing <strong>{BRAND.name} (SSPH)</strong>, you agree to use study
          materials solely for personal, non-commercial educational preparation.
        </p>
        <h2 className="text-base font-bold text-[#101B33] pt-2">
          1. Access Model
        </h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>FREE &amp; AD-SUPPORTED ACCESS:</strong> Open-access study PDFs can be
            downloaded directly, and ad-supported resources unlock through verified
            ad-supported links at no membership fee.
          </li>
          <li>
            <strong>SUBSCRIPTIONS PAUSED:</strong> Paid passes and memberships are
            currently disabled while the platform focuses on free &amp; ad-supported study
            resources.
          </li>
        </ul>
        <h2 className="text-base font-bold text-[#101B33] pt-2">
          2. Prohibited Conduct
        </h2>
        <p>
          Automated scraping, credential sharing, bypassing ad-verification callbacks, or
          redistributing downloaded PDFs commercially may result in immediate account
          suspension.
        </p>
        <p className="text-xs text-slate-500 pt-2">{BRAND.disclaimerShort}</p>
      </Card>
    </div>
  );
}
