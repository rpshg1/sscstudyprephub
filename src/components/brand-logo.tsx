import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function BrandLogo({
  compact = false,
  darkText = true,
}: {
  compact?: boolean;
  darkText?: boolean;
}) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 group focus-visible:outline-none"
      aria-label={`${BRAND.name} (${BRAND.shortName}) Home`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-xs ring-1 ring-amber-400/50 group-hover:ring-[#2563EB] transition-all overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt={`${BRAND.name} (${BRAND.shortName}) logo`}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </span>
      <div className="flex flex-col leading-none">
        <span
          className={`text-sm sm:text-base font-extrabold tracking-tight ${
            darkText ? "text-[#101B33]" : "text-white"
          }`}
        >
          {BRAND.name}
        </span>
        {!compact && (
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
              darkText ? "text-slate-500" : "text-slate-300"
            }`}
          >
            {BRAND.shortName} • Study Hub
          </span>
        )}
      </div>
    </Link>
  );
}
