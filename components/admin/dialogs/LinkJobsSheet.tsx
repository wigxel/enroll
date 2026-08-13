"use client";

import { Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { Id } from "~/convex/_generated/dataModel";
import { formatSalaryRange } from "~/lib/job.helpers";
import type { JobRecord } from "./JobFormDialog";

interface LinkJobsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableJobs: JobRecord[];
  linkedJobs: JobRecord[];
  onLink: (jobIds: Id<"jobs">[]) => void;
  onCreateNew: () => void;
}

export function LinkJobsSheet(props: LinkJobsSheetProps) {
  const {
    isOpen,
    onOpenChange,
    availableJobs,
    linkedJobs,
    onLink,
    onCreateNew,
  } = props;

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Id<"jobs">[]>([]);

  // Stale selections from a previous visit would silently re-link on the next
  // open, so clear them whenever the sheet closes.
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setSearch("");
    }
  }, [isOpen]);

  const linkedIds = linkedJobs.map((job) => job._id);
  const query = search.trim().toLowerCase();

  const allJobs = [...linkedJobs, ...availableJobs];
  const filteredJobs = query
    ? allJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query),
      )
    : allJobs;

  const handleLink = () => {
    const newIds = selectedIds.filter((id) => !linkedIds.includes(id));
    if (newIds.length > 0) onLink(newIds);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Link Job Opportunities</SheetTitle>
          <SheetDescription>
            Pick from your job library or create a new opportunity.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Input
            placeholder="Search by title, company, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <div className="space-y-2">
            {allJobs.length === 0 ? (
              <div className="py-8 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  Your job library is empty.
                </p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No jobs match your search.
              </p>
            ) : (
              filteredJobs.map((job) => {
                const linked = linkedIds.includes(job._id);
                const selected = selectedIds.includes(job._id);

                return (
                  <button
                    key={job._id}
                    type="button"
                    disabled={linked}
                    onClick={() =>
                      setSelectedIds((prev) =>
                        prev.includes(job._id)
                          ? prev.filter((id) => id !== job._id)
                          : [...prev, job._id],
                      )
                    }
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${
                      linked
                        ? "border-gray-200 bg-gray-50 opacity-50"
                        : selected
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selected && (
                        <svg
                          role="img"
                          aria-label="Selected"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3 text-white"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          linked ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {job.company} ·{" "}
                        {formatSalaryRange(job.salaryMin, job.salaryMax)}
                      </p>
                      {linked && (
                        <span className="text-xs font-medium text-green-600">
                          Already linked
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t py-4">
          <p className="mb-3 text-sm text-gray-500">
            Can't find the role you're looking for?
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCreateNew}
            className="w-full"
          >
            + Create New Job
          </Button>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleLink}
            disabled={selectedIds.length === 0}
          >
            Link Job{selectedIds.length > 1 ? "s" : ""}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
