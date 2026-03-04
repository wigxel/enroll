"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
    enrolledAt: string;
    course: string;
    cohort: string;
}

// Mock data — TODO: Replace with useQuery(api.users.listStudents)
const mockStudents: Student[] = [
    { id: "s1", name: "Alice Johnson", email: "alice@example.com", enrolledAt: "2026-01-15T10:00:00Z", course: "Software Engineering", cohort: "Cohort A - 2026" },
    { id: "s2", name: "Bob Williams", email: "bob@example.com", enrolledAt: "2026-01-20T10:00:00Z", course: "Data Science", cohort: "Cohort A - 2026" },
    { id: "s3", name: "Carol Martinez", email: "carol@example.com", enrolledAt: "2026-02-01T10:00:00Z", course: "Product Design", cohort: "Cohort B - 2026" },
    { id: "s4", name: "David Lee", email: "david@example.com", enrolledAt: "2026-02-15T10:00:00Z", course: "Software Engineering", cohort: "Cohort B - 2026" },
    { id: "s5", name: "Emily Chang", email: "emily@example.com", enrolledAt: "2026-02-20T10:00:00Z", course: "Data Science", cohort: "Cohort A - 2026" },
];

type SortKey = "enrolledAt" | "name";

export default function StudentsPage() {
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("enrolledAt");

    const filteredStudents = useMemo(() => {
        const results = mockStudents.filter((s) => {
            return (
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.email.toLowerCase().includes(search.toLowerCase())
            );
        });

        return results.sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
        });
    }, [search, sortBy]);

    return (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {mockStudents.length} enrolled student{mockStudents.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Search & Sort */}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortKey)}
                        className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="enrolledAt">Newest First</option>
                        <option value="name">Name A–Z</option>
                    </select>
                </div>

                {/* Students Table */}
                {filteredStudents.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                        <h3 className="text-sm font-medium text-gray-900">
                            No students found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {search ? "Try adjusting your search." : "No students enrolled yet."}
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300 bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Student
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Course
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Cohort
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Enrolled
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="flex items-center">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                    {student.name.split(" ").map((n) => n[0]).join("")}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="font-medium text-gray-900">
                                                        {student.name}
                                                    </div>
                                                    <div className="text-gray-500">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                            {student.course}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {student.cohort}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {new Date(student.enrolledAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
