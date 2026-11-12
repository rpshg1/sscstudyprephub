import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ShieldCheck, Info } from "lucide-react";
import { SUBSCRIPTIONS_ENABLED } from "@/lib/constants";
import { getRazorpayConfigStatus } from "@/lib/razorpay";
import { Badge, Card } from "@/components/ui/primitives";
import { PricingCards } from "@/components/pricing-cards";

export const revalidate = 300;

export const metadata: Metadata = SUBSCRIPTIONS_ENABLED
  ? {
      title: "Membership & Pricing — Free ₹0, 10 Books ₹59, Lifetime ₹300",
      description:
        "Compare SSPH plans: Free ad-supported access (₹0), 10 Books Pass (₹59 one-time), and Lifetime Premium membership (₹300 one-time).",
      alternates: { canonical: "/pricing" },
    }
  : {
      title: "Free Access — Subscriptions Paused",
      description:
        "Paid membership plans are currently paused. Access available SSC study books, notes, PYQs, and roadmaps for free on SSPH.",
      robots: { index: false, follow: true },
    };

export default async function PricingPage() {
  if (!SUBSCRIPTIONS_ENABLED) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="p-8 sm:p-10 text-center space-y-5">
          <Badge tone="green">100% Free &amp; Ad-Supported Right Now</Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B33] sm:text-3xl">
            Subscriptions Are Currently Paused
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            We have removed all paid subscription plans and passes for now. You can browse
            the library and access available SSC study PDFs free directly or through
            ad-supported links.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/library"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
            >
              <BookOpenCheck className="h-4 w-4" />
              Browse Free Resource Library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const razorpay = getRazorpayConfigStatus();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Badge tone="blue">Transparent Student Pricing</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#101B33] sm:text-4xl">
          Upgrade Your SSC Preparation
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Keep studying free with ad-supported unlocks, pick a 10-Book Pass for ₹59, or
          enjoy unlimited ad-free downloads with ₹300 Lifetime Premium.
        </p>
      </div>

      <div className="mt-10">
        <PricingCards
          isLoggedIn={false}
          razorpayConfigured={razorpay.configured}
          interactive
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[#101B33] font-bold">
            <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
            <h2>How 10 Books Pass Credits Work</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
            <li>One-time ₹59 payment grants 10 download credits.</li>
            <li>Exactly 1 credit is deducted per unique eligible resource unlocked.</li>
            <li>Re-downloading a resource you already unlocked costs 0 credits.</li>
            <li>Concurrent duplicate clicks are blocked atomically on the server.</li>
            <li>Failed transactions or failed ad flows never deduct credits.</li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-[#101B33] font-bold">
            <Info className="h-5 w-5 text-[#2563EB]" />
            <h2>Lifetime Access &amp; Copyright Transparency</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The ₹300 Lifetime Premium membership grants unlimited access to eligible
            books, notes, PYQs, roadmaps, and future additions for the lifetime of the
            SSPH service, subject to our published{" "}
            <Link href="/terms" className="text-[#2563EB] font-semibold hover:underline">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/refund-policy"
              className="text-[#2563EB] font-semibold hover:underline"
            >
              Refund Policy
            </Link>
            . SSPH never claims to bundle unauthorized third-party copyrighted books.
          </p>
        </Card>
      </div>
    </div>
  );
}
