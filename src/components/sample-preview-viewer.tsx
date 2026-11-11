"use client";

import { useState } from "react";
import { BookOpenCheck, ExternalLink, Eye, EyeOff, Maximize2 } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui/primitives";

export function SamplePreviewViewer({
  resourceId,
  resourceTitle,
  samplePageCount,
  totalPages,
}: {
  resourceId: string;
  resourceTitle: string;
  samplePageCount: number;
  totalPages: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const sampleUrl = `/api/resources/${resourceId}/sample`;

  return (
    <Card className="mt-8 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge tone="blue">
              <BookOpenCheck className="h-3.5 w-3.5" />
              Free Book Sample
            </Badge>
            <span className="text-xs font-semibold text-slate-500">
              First {samplePageCount} {samplePageCount === 1 ? "Page" : "Pages"}
              {totalPages ? ` of ${totalPages}` : ""}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#101B33]">
            Read Sample Pages Before Downloading
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={expanded ? "outline" : "primary"}
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {expanded ? "Hide Reader" : "Load Sample Reader"}
          </Button>
          <a
            href={sampleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#101B33] px-3 text-xs font-semibold text-white hover:bg-[#1B2B4F]"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Open Sample PDF
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {expanded ? (
        <div className="bg-slate-100 p-2 sm:p-4">
          <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
            <iframe
              src={`${sampleUrl}#view=FitH`}
              title={`${resourceTitle} — First ${samplePageCount} Pages Sample`}
              loading="lazy"
              className="h-[520px] w-full sm:h-[680px]"
            />
          </div>
          <p className="mt-2.5 text-center text-xs text-slate-600">
            Showing the opening {samplePageCount} pages as a free sample. On mobile browsers
            that block embedded PDFs, tap{" "}
            <a
              href={sampleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              Open Sample PDF
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-start justify-between gap-3 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-xs leading-5 text-slate-600">
            Preview stays collapsed until requested so this page loads instantly on mobile
            networks. Click <strong>Load Sample Reader</strong> to read the first{" "}
            {samplePageCount} pages inline.
          </p>
        </div>
      )}
    </Card>
  );
}
