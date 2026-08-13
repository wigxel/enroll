"use client";

import { formatDistanceToNow } from "date-fns";
import { Building2, Clock, Loader2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  formatSpecialties,
  HIRE_PERIOD_LABELS,
  JOB_DURATION_LABELS,
  TALENT_REQUEST_STATUSES,
  type TalentRequestStatus,
} from "~/lib/talent.helpers";
import type { TalentRequestRow } from "./types";

const statusStyles: Record<TalentRequestStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  in_review: "bg-yellow-100 text-yellow-800",
  shortlisted: "bg-purple-100 text-purple-800",
  placed: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
};

/** Formats an ISO timestamp as "3 hours ago", tolerating malformed input. */
const relativeTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  return formatDistanceToNow(date, { addSuffix: true });
};

interface TalentRequestCardProps {
  request: TalentRequestRow;
  canManage: boolean;
  onStatusChange: (status: TalentRequestStatus) => Promise<void>;
}

export function TalentRequestCard(props: TalentRequestCardProps) {
  const { request, canManage, onStatusChange } = props;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (status: TalentRequestStatus) => {
    if (status === request.status) return;
    setIsUpdating(true);
    try {
      await onStatusChange(status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
            <h3 className="font-medium text-gray-900">{request.companyName}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[request.status]}`}
            >
              {
                TALENT_REQUEST_STATUSES.find((s) => s.key === request.status)
                  ?.label
              }
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <a
              href={`mailto:${request.companyEmail}`}
              className="flex items-center gap-1.5 hover:text-gray-900 hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              {request.companyEmail}
            </a>
            <a
              href={`tel:${request.contactPhone}`}
              className="flex items-center gap-1.5 hover:text-gray-900 hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {request.contactPhone}
            </a>
          </div>
        </div>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={isUpdating}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Move to...
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Set status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TALENT_REQUEST_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status.key}
                  disabled={status.key === request.status}
                  onClick={() => void handleSelect(status.key)}
                >
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          {HIRE_PERIOD_LABELS[request.hirePeriod]}
        </span>
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          {JOB_DURATION_LABELS[request.jobDuration]}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-gray-700">
        {formatSpecialties(request.specialties)}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
        {request.description}
      </p>

      {request.outcomeNote && (
        <p className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-600">
          <span className="font-medium">Note:</span> {request.outcomeNote}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Received {relativeTime(request.createdAt)}
        </span>
        {request.firstRespondedAt ? (
          <span>First response {relativeTime(request.firstRespondedAt)}</span>
        ) : (
          <span className="font-medium text-amber-600">Awaiting response</span>
        )}
        {request.reviewedByName && (
          <span>Last touched by {request.reviewedByName}</span>
        )}
      </div>
    </div>
  );
}
