import type { Metadata } from "next";
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
      </Card>
    </div>
  );
}
