import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Copyright Policy & DMCA Takedown Process",
  description: "SSPH strict anti-piracy policy and copyright takedown notice procedure.",
  alternates: { canonical: "/copyright-dmca" },
};

export default function CopyrightDmcaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Badge tone="red">Intellectual Property Compliance</Badge>
        <h1 className="mt-2 text-3xl font-extrabold text-[#101B33]">
          Copyright Policy &amp; DMCA Notice Process
        </h1>
      </div>

      <Card className="p-6 sm:p-8 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          SSCSTUDYPREPHUB (SSPH) respects intellectual property rights and strictly
          prohibits uploading, hosting, or linking pirated or unauthorized third-party
          books. Administrators may only publish original study resources, open-license
          compilations, or materials for which SSPH holds explicit distribution rights.
        </p>
        <h2 className="text-base font-bold text-[#101B33] pt-2">
          How to Submit a Copyright / DMCA Takedown Request
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Identify the exact SSPH resource URL or slug in question.</li>
          <li>Describe the copyrighted work and provide proof of ownership or authorization.</li>
          <li>Provide your full legal name and contact email address.</li>
          <li>
            Include a good-faith statement that the disputed distribution is not authorized
            by the copyright owner, its agent, or the law.
          </li>
        </ul>
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-2">
          <h3 className="text-sm font-bold text-[#101B33]">
            Direct Email for Book Removal, Copyright &amp; Support
          </h3>
          <p className="text-xs leading-relaxed text-slate-700">
            Authors, publishers, copyright owners, or students can send book removal
            requests, content corrections, or support inquiries directly to{" "}
            <a
              href={`mailto:${BRAND.copyrightEmail}?subject=${encodeURIComponent("Book Removal / Copyright Request - SSPH")}`}
              className="font-bold text-[#2563EB] hover:underline"
            >
              {BRAND.copyrightEmail}
            </a>{" "}
            or submit an immediate ticket using our{" "}
            <Link
              href="/contact?type=COPYRIGHT_DMCA"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              Book Removal &amp; Copyright Takedown Form
            </Link>
            . Verified removal requests result in prompt unpublishing and deletion from
            public listings.
          </p>
        </div>
      </Card>
    </div>
  );
}
