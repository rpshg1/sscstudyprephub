import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund and billing support policy for SSPH ₹59 10-Books Pass and ₹300 Lifetime Premium.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Badge tone="slate">Billing Policy</Badge>
        <h1 className="mt-2 text-3xl font-extrabold text-[#101B33]">
          Refund Policy
        </h1>
      </div>

      <Card className="p-6 sm:p-8 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          Because SSPH digital passes (₹59 10 Books Pass and ₹300 Lifetime Premium)
          provision instant access to digital PDF downloads, purchases are generally
          non-refundable once credits are consumed or premium downloads have occurred.
        </p>
        <h2 className="text-base font-bold text-[#101B33] pt-2">
          Eligible Refund Scenarios
        </h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Duplicate payment debited for the exact same order due to a gateway error.</li>
          <li>
            Failed transaction where funds were deducted by your bank/UPI app and not
            automatically reversed within 5–7 business days.
          </li>
          <li>
            Unresolved technical inability to access an eligible resource within 7 days of
            purchase where zero credits/downloads were consumed.
          </li>
        </ul>
        <p>
          To request billing assistance, include your Razorpay Order ID via our{" "}
          <Link
            href="/contact?type=PAYMENT_SUPPORT"
            className="font-semibold text-[#2563EB] hover:underline"
          >
            Payment Support Form
          </Link>{" "}
          or email {BRAND.supportEmail}.
        </p>
      </Card>
    </div>
  );
}
