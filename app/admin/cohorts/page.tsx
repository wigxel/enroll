"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CohortFormDialog } from "~/components/admin/dialogs/CreateCohortDialog";

type CohortStatus = "active" | "upcoming" | "completed";

interface Cohort {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    enrolledStudents: number;
    capacity: number | null;
    status: CohortStatus;
}

// Mock data
const mockCohorts: Cohort[] = [
    { id: "c1", name: "Spring 2026 — Software Engineering", startDate: "2026-03-01", endDate: "2026-06-01", enrolledStudents: 25, capacity: 30, status: "active" },
    { id: "c2", name: "Fall 2026 — Data Science", startDate: "2026-09-01", endDate: "2026-12-15", enrolledStudents: 0, capacity: 40, status: "upcoming" },
    { id: "c3", name: "Fall 2025 — Web Development", startDate: "2025-09-01", endDate: "2025-12-15", enrolledStudents: 28, capacity: 30, status: "completed" },
];

const statusBadge: Record<CohortStatus, string> = {
    active: "bg-green-100 text-green-800",
    upcoming: "bg-blue-100 text-blue-800",
    completed: "bg-gray-100 text-gray-800",
};

export default function CohortsPage() {
    const [showDialog, setShowDialog] = useState(false);
    const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);

    const openCreateDialog = () => {
        setEditingCohort(null);
        setShowDialog(true);
    };

    const openEditDialog = (cohort: Cohort) => {
        setEditingCohort(cohort);
        setShowDialog(true);
    };

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
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Cohort Name</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Date</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">End Date</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Students</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockCohorts.map((cohort) => (
                                <tr key={cohort.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        <Link
                                            href={`/admin/cohorts/${cohort.id}`}
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
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {cohort.enrolledStudents}
                                        {cohort.capacity ? ` / ${cohort.capacity}` : ""}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadge[cohort.status]}`}>
                                            {cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1)}
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
                            ))}
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
