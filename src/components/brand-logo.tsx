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
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#101B33] text-white shadow-xs ring-1 ring-white/10 group-hover:bg-[#2563EB] transition-colors">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 5.5C4 4.67157 4.67157 4 5.5 4H11C11.5523 4 12 4.44772 12 5V19.5C12 19.5 9.8 18.2 5.5 18.2C4.67157 18.2 4 17.5284 4 16.7V5.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M20 5.5C20 4.67157 19.3284 4 18.5 4H13C12.4477 4 12 4.44772 12 5V19.5C12 19.5 14.2 18.2 18.5 18.2C19.3284 18.2 20 17.5284 20 16.7V5.5Z"
            stroke="#93C5FD"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
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
