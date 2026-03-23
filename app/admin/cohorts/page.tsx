"use client";

import { useQuery } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CohortFormDialog } from "~/components/admin/dialogs/CreateCohortDialog";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

type CohortStatus = "active" | "upcoming" | "completed";

const statusBadge: Record<CohortStatus, string> = {
  active: "bg-green-100 text-green-800",
  upcoming: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function CohortsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCohort, setEditingCohort] = useState<{
    _id: Id<"cohorts">;
    name: string;
    startDate: string;
    endDate: string;
    capacity?: number;
  } | null>(null);

  const resultRaw = useQuery(api.cohorts.list, {});
  const cohorts = resultRaw?.success ? resultRaw.data.cohorts : [];

  const openCreateDialog = () => {
    setEditingCohort(null);
    setShowDialog(true);
  };

  const openEditDialog = (cohort: {
    _id: Id<"cohorts">;
    name: string;
    startDate: string;
    endDate: string;
    capacity?: number;
  }) => {
    setEditingCohort(cohort);
    setShowDialog(true);
  };

  const isLoading = resultRaw === undefined;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Cohorts</h1>
          <button
            type="button"
            onClick={openCreateDialog}
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 sm:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Cohort
          </button>
        </div>

        {/* Cohorts Table */}
        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Cohort Name
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Start Date
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  End Date
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Students
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : resultRaw.success === false ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-red-600 bg-red-50"
                  >
                    {/*@ts-expect-error Possibly an issue with Typescript*/}
                    {resultRaw.error}
                  </td>
                </tr>
              ) : cohorts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No cohorts found. Create your first cohort to get started.
                  </td>
                </tr>
              ) : (
                cohorts.map((cohort: any) => (
                  <tr key={cohort._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <Link
                        href={`/admin/cohorts/${cohort._id}`}
                        className="text-primary hover:text-primary/80"
                      >
                        {cohort.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(cohort.startDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(cohort.endDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <Link
                        href={`/admin/users?cohort=${cohort._id}`}
                        className="text-primary hover:text-primary/80 hover:underline"
                      >
                        {cohort.studentCount}
                        {cohort.capacity ? ` / ${cohort.capacity}` : ""}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadge[cohort.status]}`}
                      >
                        {cohort.status.charAt(0).toUpperCase() +
                          cohort.status.slice(1)}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        type="button"
                        onClick={() => openEditDialog(cohort)}
                        className="text-primary hover:text-primary/80"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CohortFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        cohort={editingCohort}
      />
    </div>
  );
}
