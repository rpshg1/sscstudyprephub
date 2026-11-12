"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, FileText, ArrowRight } from "lucide-react";
import { formatExamLabel } from "@/lib/constants";

interface SuggestionItem {
  slug: string;
  title: string;
  subject: string;
  examCategory: string;
  accessType: string;
}

export function SearchBar({
  initialQuery = "",
  placeholder = "Search books, notes, PYQs and syllabus...",
  className = "",
  basePath = "/library",
}: {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  basePath?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/resources/suggestions?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions?: SuggestionItem[] };
        setSuggestions(data.suggestions ?? []);
      } catch {
        // Ignore aborted fetch
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const visibleSuggestions = query.trim().length >= 2 ? suggestions : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const trimmed = query.trim();
    router.push(trimmed ? `${basePath}?q=${encodeURIComponent(trimmed)}` : basePath);
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex w-full items-center rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-sm focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-500/15"
      >
        <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label="Search SSC study resources"
          className="h-10 w-full bg-transparent px-3 text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors cursor-pointer"
        >
          <span>Search</span>
        </button>
      </form>

      {open && visibleSuggestions.length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-lg"
        >
          <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Matching Resources
          </div>
          <ul className="divide-y divide-[#E2E8F0]">
            {visibleSuggestions.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/resources/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#101B33]">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.subject} • {formatExamLabel(item.examCategory)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-1.5 border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 cursor-pointer"
          >
            View all results for &ldquo;{query.trim()}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
