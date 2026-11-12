"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import {
  ACCESS_TYPE_OPTIONS,
  EXAM_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
  SUBSCRIPTIONS_ENABLED,
} from "@/lib/constants";
import { Button, Select } from "@/components/ui/primitives";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface FilterState {
  q: string;
  exam: string;
  category: string;
  type: string;
  access: string;
  sort: string;
}

export function LibraryFilters({
  categories,
  state,
  basePath = "/library",
  hideTypeFilter = false,
  hideCategoryFilter = false,
}: {
  categories: CategoryOption[];
  state: FilterState;
  basePath?: string;
  hideTypeFilter?: boolean;
  hideCategoryFilter?: boolean;
}) {
  const router = useRouter();

  function updateFilter(patch: Partial<FilterState>) {
    const next = { ...state, ...patch };
    const params = new URLSearchParams();
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.exam && next.exam !== "ALL") params.set("exam", next.exam);
    if (!hideCategoryFilter && next.category && next.category !== "ALL") {
      params.set("category", next.category);
    }
    if (!hideTypeFilter && next.type && next.type !== "ALL") {
      params.set("type", next.type);
    }
    if (next.access && next.access !== "ALL") params.set("access", next.access);
    if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Examination
          </label>
          <Select
            aria-label="Filter by examination"
            value={state.exam}
            onChange={(e) => updateFilter({ exam: e.target.value })}
          >
            <option value="ALL">All SSC Exams</option>
            {EXAM_OPTIONS.map((exam) => (
              <option key={exam.value} value={exam.value}>
                {exam.label}
              </option>
            ))}
          </Select>
        </div>

        {!hideCategoryFilter && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Subject / Category
            </label>
            <Select
              aria-label="Filter by subject category"
              value={state.category}
              onChange={(e) => updateFilter({ category: e.target.value })}
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {!hideTypeFilter && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Resource Type
            </label>
            <Select
              aria-label="Filter by resource type"
              value={state.type}
              onChange={(e) => updateFilter({ type: e.target.value })}
            >
              <option value="ALL">All Types</option>
              {RESOURCE_TYPE_OPTIONS.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Access Level
          </label>
          <Select
            aria-label="Filter by access level"
            value={state.access}
            onChange={(e) => updateFilter({ access: e.target.value })}
          >
            <option value="ALL">
              {SUBSCRIPTIONS_ENABLED ? "Free, Ad & Premium" : "All (Free & Ad-Supported)"}
            </option>
            {(SUBSCRIPTIONS_ENABLED
              ? ACCESS_TYPE_OPTIONS
              : ACCESS_TYPE_OPTIONS.filter((acc) => acc.value !== "PREMIUM")
            ).map((acc) => (
              <option key={acc.value} value={acc.value}>
                {acc.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Sort By
          </label>
          <Select
            aria-label="Sort resources"
            value={state.sort}
            onChange={(e) => updateFilter({ sort: e.target.value })}
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push(basePath)}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
