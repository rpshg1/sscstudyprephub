"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Crown,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { PRICING_PLANS } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PricingCards({
  isLoggedIn,
  currentTier,
  razorpayConfigured,
  interactive = true,
}: {
  isLoggedIn: boolean;
  currentTier?: "FREE" | "TEN_BOOKS" | "LIFETIME";
  razorpayConfigured: boolean;
  interactive?: boolean;
}) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<"TEN_BOOKS" | "LIFETIME" | null>(null);
  const [notice, setNotice] = useState<{
    type: "error" | "info" | "success";
    message: string;
  } | null>(null);

  async function handleCheckout(planType: "TEN_BOOKS" | "LIFETIME") {
    setNotice(null);

    if (!isLoggedIn) {
      router.push("/login?next=/pricing");
      return;
    }

    setLoadingPlan(planType);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const orderData = (await orderRes.json()) as {
        configured?: boolean;
        keyId?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        planTitle?: string;
        customer?: { name: string; email: string };
        error?: string;
      };

      if (orderRes.status === 503 || orderData.configured === false) {
        setNotice({
          type: "info",
          message:
            orderData.error ||
            "Razorpay credentials are not configured yet. Please configure RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET in your environment variables.",
        });
        return;
      }

      if (!orderRes.ok || !orderData.orderId || !orderData.keyId) {
        setNotice({
          type: "error",
          message: orderData.error || "Unable to create Razorpay order.",
        });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setNotice({
          type: "error",
          message: "Could not load Razorpay Checkout script. Check your network connection.",
        });
        return;
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "SSCSTUDYPREPHUB (SSPH)",
        description: `${orderData.planTitle} Membership`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customer?.name,
          email: orderData.customer?.email,
        },
        theme: { color: "#2563EB" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = (await verifyRes.json()) as {
            verified?: boolean;
            error?: string;
          };
          if (!verifyRes.ok || !verifyData.verified) {
            setNotice({
              type: "error",
              message:
                verifyData.error ||
                "Payment signature verification failed. No membership changes applied.",
            });
            return;
          }
          setNotice({
            type: "success",
            message:
              "Payment verified on server! Your membership and credits are now active.",
          });
          router.refresh();
        },
      });

      rzp.open();
    } catch {
      setNotice({
        type: "error",
        message: "Payment initialization failed. Please try again.",
      });
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : notice.type === "info"
                ? "border-amber-200 bg-amber-50 text-amber-950"
                : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
          )}
          <div className="space-y-1">
            <p className="font-semibold">
              {notice.type === "success"
                ? "Membership Updated"
                : notice.type === "info"
                  ? "Razorpay Integration Notice"
                  : "Payment Error"}
            </p>
            <p className="text-xs leading-relaxed">{notice.message}</p>
          </div>
        </div>
      )}

      {interactive && !razorpayConfigured && !notice && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-[#172033]">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[#2563EB] mt-0.5" />
          <div>
            <p className="font-bold text-[#101B33]">
              Razorpay Server Verification Architecture Ready (Awaiting Credentials)
            </p>
            <p className="mt-1 leading-relaxed text-slate-600">
              Razorpay test/live API keys are not yet configured in environment variables.
              Payments are never simulated in production—add{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] border border-[#E2E8F0]">
                RAZORPAY_KEY_ID
              </code>
              ,{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] border border-[#E2E8F0]">
                RAZORPAY_KEY_SECRET
              </code>{" "}
              and{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] border border-[#E2E8F0]">
                RAZORPAY_WEBHOOK_SECRET
              </code>{" "}
              to enable live ₹59 and ₹300 checkouts.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* PLAN 1: FREE */}
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {PRICING_PLANS.FREE.title}
            </span>
            {currentTier === "FREE" && <Badge tone="slate">Current Plan</Badge>}
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#101B33]">
              {PRICING_PLANS.FREE.priceDisplay}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {PRICING_PLANS.FREE.billingLabel}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {PRICING_PLANS.FREE.description}
          </p>

          <ul className="mt-6 space-y-3 text-sm text-[#172033]">
            {PRICING_PLANS.FREE.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-[#2563EB] mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            <Link
              href={isLoggedIn ? "/library" : "/signup"}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#101B33] hover:bg-[#F8FAFC]"
            >
              {isLoggedIn ? "Browse Free Library" : "Start Free"}
            </Link>
          </div>
        </Card>

        {/* PLAN 2: 10 BOOKS PASS ₹59 */}
        <Card className="flex flex-col border-[#2563EB]/40 p-6 ring-1 ring-[#2563EB]/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              {PRICING_PLANS.TEN_BOOKS.title}
            </span>
            <Badge tone="blue">Popular Value</Badge>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#101B33]">
              {PRICING_PLANS.TEN_BOOKS.priceDisplay}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {PRICING_PLANS.TEN_BOOKS.billingLabel}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {PRICING_PLANS.TEN_BOOKS.description}
          </p>

          <ul className="mt-6 space-y-3 text-sm text-[#172033]">
            {PRICING_PLANS.TEN_BOOKS.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-[#2563EB] mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            {interactive ? (
              <Button
                size="lg"
                variant="outline"
                className="w-full min-h-11 border-[#2563EB] text-[#2563EB] hover:bg-blue-50"
                onClick={() => handleCheckout("TEN_BOOKS")}
                disabled={loadingPlan !== null || currentTier === "LIFETIME"}
              >
                {loadingPlan === "TEN_BOOKS" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {currentTier === "LIFETIME"
                  ? "Included in Lifetime"
                  : "Get 10 Books Pass (₹59)"}
              </Button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#2563EB] bg-white px-4 text-sm font-semibold text-[#2563EB] hover:bg-blue-50"
              >
                Choose 10 Books (₹59)
              </Link>
            )}
          </div>
        </Card>

        {/* PLAN 3: LIFETIME PREMIUM ₹300 */}
        <Card className="flex flex-col border-[#101B33] bg-[#101B33] p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-300">
              <Crown className="h-4 w-4" />
              {PRICING_PLANS.LIFETIME.title}
            </span>
            <Badge tone="blue" className="bg-[#2563EB] text-white border-[#2563EB]">
              Best Deal
            </Badge>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">
              {PRICING_PLANS.LIFETIME.priceDisplay}
            </span>
            <span className="text-xs font-medium text-slate-300">
              {PRICING_PLANS.LIFETIME.billingLabel}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            {PRICING_PLANS.LIFETIME.description}
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-100">
            {PRICING_PLANS.LIFETIME.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            {interactive ? (
              <Button
                size="lg"
                className="w-full min-h-11 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                onClick={() => handleCheckout("LIFETIME")}
                disabled={loadingPlan !== null || currentTier === "LIFETIME"}
              >
                {loadingPlan === "LIFETIME" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {currentTier === "LIFETIME"
                  ? "Lifetime Access Active"
                  : "Get Lifetime Premium (₹300)"}
              </Button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Get Lifetime Access (₹300)
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
