import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { ResourceCover } from "@/components/resource-cover";
import { formatExamLabel } from "@/lib/constants";
import type { PublicResource } from "@/lib/resources";

export function ResourceCard({ resource }: { resource: PublicResource }) {
  const accessTone =
    resource.accessType === "FREE"
      ? "green"
      : resource.accessType === "AD_SUPPORTED"
        ? "blue"
        : "navy";

  const accessLabel =
    resource.accessType === "FREE"
      ? resource.resourceType === "ROADMAP"
        ? "Free Roadmap"
        : "Free • No Ads"
      : resource.accessType === "AD_SUPPORTED"
        ? "Ad-Supported"
        : "Paused";

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/resources/${resource.slug}`} className="block p-4 pb-0">
        <ResourceCover
          title={resource.title}
          subject={resource.subject}
          examCategory={resource.examCategory}
          resourceType={resource.resourceType}
          coverImageUrl={resource.coverImageUrl}
          coverAccent={resource.coverAccent}
          isDemo={resource.isDemo}
          compact
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={accessTone}>{accessLabel}</Badge>
          <Badge tone="slate">{formatExamLabel(resource.examCategory)}</Badge>
        </div>

        <Link
          href={`/resources/${resource.slug}`}
          className="mt-2.5 text-base font-bold leading-snug text-[#101B33] hover:text-[#2563EB] line-clamp-2"
        >
          {resource.title}
        </Link>

        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
          {resource.description}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs text-slate-500">
            <span className="font-medium text-[#172033] truncate max-w-[55%]">
              {resource.subject}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] shrink-0">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              {resource.fileFormat} • {resource.fileSizeLabel}
            </span>
          </div>

          <Link
            href={`/resources/${resource.slug}`}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <Download className="h-4 w-4" />
            {resource.accessType === "FREE" ? "Download Free PDF" : "Download Now"}
          </Link>
        </div>
      </div>
    </Card>
  );
}
