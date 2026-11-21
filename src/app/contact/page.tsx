import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";
import { ContactComplaintForm } from "@/components/contact-form";
import { SocialBadges } from "@/components/social-icons";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach the SSCSTUDYPREPHUB (SSPH) support, payment, or compliance team, or join our official community on Telegram, Instagram, and YouTube.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawType = typeof sp.type === "string" ? sp.type : "GENERAL";
  const defaultType = (
    ["COPYRIGHT_DMCA", "CONTENT_ERROR", "PAYMENT_SUPPORT", "GENERAL"].includes(rawType)
      ? rawType
      : "GENERAL"
  ) as "COPYRIGHT_DMCA" | "CONTENT_ERROR" | "PAYMENT_SUPPORT" | "GENERAL";
  const defaultSlug = typeof sp.slug === "string" ? sp.slug : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Badge tone="blue">Support &amp; Community</Badge>
        <h1 className="mt-2 text-3xl font-extrabold text-[#101B33]">Contact Us</h1>
        <p className="mt-2 text-sm text-slate-600">
          Need help with a download, 10-Books Pass credits, Razorpay payment verification,
          or a copyright takedown notice? Connect with us directly or join our student community.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 text-sm space-y-1.5">
          <p className="font-bold text-[#101B33]">
            Student Support
          </p>
          <p className="text-xs text-slate-600">
            Account help, download issues, or feedback:
          </p>
          <a
            href={`mailto:${BRAND.supportEmail}?subject=${encodeURIComponent("SSPH Support Request")}`}
            className="inline-block font-semibold text-[#2563EB] hover:underline break-all"
          >
            {BRAND.supportEmail}
          </a>
        </Card>
        <Card className="p-5 text-sm space-y-1.5 border-amber-200 bg-amber-50/40">
          <p className="font-bold text-[#101B33]">
            Book Removal &amp; DMCA
          </p>
          <p className="text-xs text-slate-600">
            Authors/publishers requesting removal:
          </p>
          <a
            href={`mailto:${BRAND.copyrightEmail}?subject=${encodeURIComponent("Request for Book Removal - SSPH")}`}
            className="inline-block font-semibold text-[#2563EB] hover:underline break-all"
          >
            {BRAND.copyrightEmail}
          </a>
        </Card>
        <Card className="p-5 text-sm space-y-2 border-blue-200 bg-blue-50/40">
          <p className="font-bold text-[#101B33]">
            Official Community
          </p>
          <p className="text-xs text-slate-600">
            Join Telegram, Insta &amp; YouTube:
          </p>
          <div className="pt-1">
            <SocialBadges size="sm" />
          </div>
        </Card>
      </div>

      <ContactComplaintForm defaultType={defaultType} defaultSlug={defaultSlug} />
    </div>
  );
}
