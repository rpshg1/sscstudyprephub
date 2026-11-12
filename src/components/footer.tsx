import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { BrandLogo } from "@/components/brand-logo";

export function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#101B33] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo darkText={false} />
            <p className="text-sm leading-relaxed text-slate-300">
              {BRAND.tagline} A clean, student-first digital study library built for SSC
              CGL, CHSL, MTS, CPO, and GD aspirants across India.
            </p>
            <p className="text-xs leading-relaxed text-slate-400">
              {BRAND.disclaimerShort}
            </p>
            <p className="text-xs text-slate-300">
              Support &amp; Book Removal:{" "}
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="font-semibold text-blue-300 hover:text-white underline"
              >
                {BRAND.supportEmail}
              </a>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Library & Exams
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/library?exam=SSC_CGL" className="hover:text-white">
                  SSC CGL Resources
                </Link>
              </li>
              <li>
                <Link href="/library?exam=SSC_CHSL" className="hover:text-white">
                  SSC CHSL Resources
                </Link>
              </li>
              <li>
                <Link href="/library?exam=SSC_MTS" className="hover:text-white">
                  SSC MTS Resources
                </Link>
              </li>
              <li>
                <Link href="/library?exam=SSC_CPO" className="hover:text-white">
                  SSC CPO Resources
                </Link>
              </li>
              <li>
                <Link href="/library?exam=SSC_GD" className="hover:text-white">
                  SSC GD Resources
                </Link>
              </li>
              <li>
                <Link href="/library?type=PYQ" className="hover:text-white">
                  SSC Previous Year Papers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">
                  About SSPH
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Account Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white">
                  Register Free Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Legal & Compliance
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white">
                  Educational Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/copyright-dmca" className="hover:text-white">
                  Copyright Policy &amp; DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {BRAND.name} ({BRAND.shortName}). All rights
            reserved.
          </p>
          <p>
            Independent educational hub • Not affiliated with Staff Selection Commission (SSC).
          </p>
        </div>
      </div>
    </footer>
  );
}
