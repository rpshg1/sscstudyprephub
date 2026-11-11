import { formatExamLabel, formatResourceTypeLabel } from "@/lib/constants";

export function ResourceCover({
  title,
  subject,
  examCategory,
  resourceType,
  coverImageUrl,
  coverAccent = "#2563EB",
  isDemo = false,
  compact = false,
}: {
  title: string;
  subject: string;
  examCategory: string;
  resourceType: string;
  coverImageUrl?: string | null;
  coverAccent?: string;
  isDemo?: boolean;
  compact?: boolean;
}) {
  if (coverImageUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] ${
          compact ? "h-60 p-1.5" : "aspect-[3/4] max-h-[480px] w-full p-2"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImageUrl}
          alt={title}
          className="h-full w-full rounded object-contain shadow-2xs"
        />
        {isDemo && (
          <span className="absolute top-2.5 right-2.5 rounded bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#101B33]">
            DEMO
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#101B33] p-4 text-white ${
        compact ? "h-60" : "aspect-[3/4] max-h-[480px] w-full p-6"
      }`}
    >
      <div
        className="absolute inset-y-0 left-0 w-2"
        style={{ backgroundColor: coverAccent }}
        aria-hidden="true"
      />
      <div className="pl-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
          SSPH LIBRARY
        </span>
        {isDemo && (
          <span className="rounded bg-amber-400/95 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#101B33]">
            DEMO
          </span>
        )}
      </div>

      <div className="pl-2 my-auto space-y-1.5">
        <span
          className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: coverAccent }}
        >
          {formatExamLabel(examCategory)}
        </span>
        <h4
          className={`font-bold leading-snug text-white line-clamp-3 ${
            compact ? "text-sm" : "text-lg sm:text-xl"
          }`}
        >
          {title}
        </h4>
      </div>

      <div className="pl-2 flex items-center justify-between border-t border-white/15 pt-2.5 text-[11px] text-slate-300">
        <span className="truncate font-medium">{subject}</span>
        <span className="shrink-0 font-mono text-[10px] uppercase text-blue-200">
          {formatResourceTypeLabel(resourceType)}
        </span>
      </div>
    </div>
  );
}
