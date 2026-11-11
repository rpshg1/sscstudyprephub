import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Educational Disclaimer",
  description: "Important independence and educational disclaimer for SSCSTUDYPREPHUB (SSPH).",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Badge tone="navy">Legal Notice</Badge>
        <h1 className="mt-2 text-3xl font-extrabold text-[#101B33]">
          Educational Disclaimer
        </h1>
      </div>

      <Card className="p-6 sm:p-8 space-y-4 text-sm leading-relaxed text-slate-700">
        <p className="font-semibold text-[#101B33]">{BRAND.disclaimerShort}</p>
        <p>
          All notes, preparation roadmaps, practice sets, and current affairs digests
          published on SSCSTUDYPREPHUB (SSPH) are provided strictly for educational
          reference and exam preparation assistance.
        </p>
        <p>
          While our editorial team strives to verify accuracy, aspirants must always rely
          on official notifications, exam calendars, syllabi, and answer keys published on
          the official Staff Selection Commission portal (ssc.gov.in) for authoritative
          updates.
        </p>
        <p>
          Sample resources clearly labelled <strong>DEMO</strong> are original
          illustrative study outlines created for demonstration and educational practice.
          SSPH does not guarantee examination selection or specific scores.
        </p>
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-1.5">
          <h2 className="text-sm font-bold text-[#101B33]">
            Support &amp; Book Removal Requests
          </h2>
          <p className="text-xs text-slate-600">
            SSPH respects intellectual property rights and does not claim ownership of
            third-party works. If you are a copyright owner or authorized representative
            and want a listed book or PDF removed, or need general support, email{" "}
            <a
              href={`mailto:${BRAND.copyrightEmail}?subject=${encodeURIComponent("Book Removal Request - SSPH")}`}
              className="font-semibold text-[#2563EB] hover:underline"
            >
              {BRAND.copyrightEmail}
            </a>{" "}
            or submit a request via{" "}
            <Link
              href="/contact?type=COPYRIGHT_DMCA"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              Contact / Copyright Takedown
            </Link>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
