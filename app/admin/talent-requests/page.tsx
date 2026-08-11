"use client";

import { useMutation, useQuery } from "convex/react";
import { Briefcase, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { safeArray } from "~/lib/data.helpers";
import {
  TALENT_REQUEST_STATUS_LABELS,
  type TalentRequestStatus,
} from "~/lib/talent.helpers";
import { TalentRequestCard } from "./talent-request-card";
import type { TalentRequestCounts, TalentRequestRow } from "./types";

/** Tabs follow the pipeline order, so the leftmost tab is the most urgent work. */
const TAB_ORDER: TalentRequestStatus[] = [
  "new",
  "in_review",
  "shortlisted",
  "placed",
  "closed",
];

const EMPTY_COUNTS: TalentRequestCounts = {
  all: 0,
  new: 0,
  in_review: 0,
  shortlisted: 0,
  placed: 0,
  closed: 0,
};

export default function TalentRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<TalentRequestStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");

  const listResult = useQuery(api.talentRequests.list, {
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search.trim() || undefined,
  });
  const updateStatus = useMutation(api.talentRequests.updateStatus);

  const requests = useMemo(
    () =>
      listResult?.success
        ? (safeArray(listResult.data.requests) as TalentRequestRow[])
        : [],
    [listResult],
  );

  const counts: TalentRequestCounts = listResult?.success
    ? (listResult.data.counts as TalentRequestCounts)
    : EMPTY_COUNTS;
  const canManage = listResult?.success ? !!listResult.data.canManage : false;

  const isLoading = listResult === undefined;
  const loadError = listResult && !listResult.success ? listResult.error : null;

  const moveRequest = async (
    requestId: Id<"talentRequests">,
    status: TalentRequestStatus,
  ) => {
    try {
      const res = await updateStatus({ requestId, status });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`Moved to ${TALENT_REQUEST_STATUS_LABELS[status]}`);
    } catch {
      toast.error("Failed to update request");
    }
  };

  /**
   * The count pill sits inside the tab, so on the active (primary) tab it needs
   * a translucent white ground and on the rest a solid one.
   */
  const countPillClass = (isActive: boolean) =>
    `ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
      isActive ? "bg-white/20" : "bg-white"
    }`;

  /** Mirrors the Applications tab styling so the two admin screens read as one product. */
  const tabClass = (isActive: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
      isActive
        ? "bg-primary text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Talent Requests
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {counts.all} total · {counts.new} awaiting a first response
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={tabClass(statusFilter === "all")}
          >
            All
            <span className={countPillClass(statusFilter === "all")}>
              {counts.all}
            </span>
          </button>
          {TAB_ORDER.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={tabClass(statusFilter === status)}
            >
              {TALENT_REQUEST_STATUS_LABELS[status]}
              <span className={countPillClass(statusFilter === status)}>
                {counts[status]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, email, phone, or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : loadError ? (
          <div className="mt-12 p-4 text-center text-red-600 bg-red-50 rounded-lg">
            {loadError}
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <Briefcase className="h-8 w-8 text-gray-300" />
            <h3 className="mt-3 text-sm font-medium text-gray-900">
              {search.trim()
                ? `No requests match "${search.trim()}"`
                : statusFilter === "all"
                  ? "No requests yet"
                  : "Nothing in this stage"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              When a business asks to hire from the site, the request lands
              here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {requests.map((request) => (
              <TalentRequestCard
                key={request._id}
                request={request}
                canManage={canManage}
                onStatusChange={(status) => moveRequest(request._id, status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
