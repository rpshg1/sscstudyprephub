import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SSCSTUDYPREPHUB (SSPH) collects, uses, and protects your account and download records.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Badge tone="slate">Legal Documentation</Badge>
        <h1 className="mt-2 text-3xl font-extrabold text-[#101B33]">
          Privacy Policy
        </h1>
      </div>

      <Card className="p-6 sm:p-8 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          At <strong>{BRAND.name} (SSPH)</strong>, we respect your privacy and collect
          only the minimal data required to operate student accounts, download credits,
          and verified payments.
        </p>
        <h2 className="text-base font-bold text-[#101B33] pt-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Account details: Name, email address, target exam, and optional phone number.</li>
          <li>Usage logs: Download history, unlocked resource records, and bookmarked items.</li>
          <li>
            Payment references: Razorpay order IDs, payment IDs, and plan status. SSPH
            <strong> never</strong> collects or stores credit/debit card numbers, CVVs, or
            UPI PINs.
          </li>
        </ul>
        <h2 className="text-base font-bold text-[#101B33] pt-2">
          2. Security &amp; Cookies
        </h2>
        <p>
          Authentication relies on HTTP-only secure session cookies and salted scrypt
          password hashing. Short-lived signed URLs protect downloadable assets from
          unauthorized access.
        </p>
        <h2 className="text-base font-bold text-[#101B33] pt-2">
          3. Third-Party Ad Providers &amp; Shortlinks
        </h2>
        <p>
          If you choose an external ad-supported link (such as ShrinkMe.io) or a
          configured rewarded-ad provider, those external platforms operate under their
          own privacy and cookie policies.
        </p>
      </Card>
    </div>
  );
}
