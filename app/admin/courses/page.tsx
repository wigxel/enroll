"use client";

import React, { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
import { CourseFormDialog } from "~/components/admin/dialogs/CourseFormDialog";

interface Course {
    id: string;
    name: string;
    description: string;
    duration: string;
    certification: string;
    tuitionFee: number;
    coverPhoto: string | null;
    order: number;
    isActive: boolean;
}

// Mock data
const mockCourses: Course[] = [
    {
        id: "course_1", name: "Software Engineering", description: "A comprehensive 12-week bootcamp covering full-stack web development.",
        duration: "12 Weeks", certification: "Certificate in Software Engineering",
        tuitionFee: 250000, coverPhoto: null, order: 1, isActive: true,
    },
    {
        id: "course_2", name: "Data Science", description: "Learn data analysis, machine learning, and statistical modeling.",
        duration: "10 Weeks", certification: "Certificate in Data Science",
        tuitionFee: 200000, coverPhoto: null, order: 2, isActive: true,
    },
    {
        id: "course_3", name: "UI/UX Design", description: "Master user interface and experience design principles.",
        duration: "8 Weeks", certification: "Certificate in UI/UX Design",
        tuitionFee: 180000, coverPhoto: null, order: 3, isActive: false,
    },
];

export default function CoursesPage() {
    const [showDialog, setShowDialog] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const openCreateDialog = () => {
        setEditingCourse(null);
        setShowDialog(true);
    };

    const openEditDialog = (course: Course) => {
        setEditingCourse(course);
        setShowDialog(true);
    };

    const toggleActive = (courseId: string) => {
        // TODO: call courses.update({ id: courseId, isActive: !current })
        console.log("Toggle active", courseId);
    };

    return (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Manage Courses
                    </h1>
                    <button
                        type="button"
                        onClick={openCreateDialog}
                        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 sm:mt-0"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Course
                    </button>
                </div>

                {/* Courses Table */}
                <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300 bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-10 py-3.5 pl-4 pr-1 sm:pl-6">
                                    <span className="sr-only">Order</span>
                                </th>
                                <th className="py-3.5 pl-2 pr-3 text-left text-sm font-semibold text-gray-900">
                                    Course Name
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Duration
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Tuition Fee
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
                            {mockCourses.map((course) => (
                                <tr key={course.id}>
                                    <td className="py-4 pl-4 pr-1 sm:pl-6">
                                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                    </td>
                                    <td className="py-4 pl-2 pr-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                                                {course.name
                                                    .split(" ")
                                                    .map((w) => w[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {course.name}
                                                </div>
                                                <div className="text-gray-500 text-xs line-clamp-1">
                                                    {course.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {course.duration}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                                        ₦{course.tuitionFee.toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${course.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {course.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => openEditDialog(course)}
                                            className="text-primary hover:text-primary/80"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleActive(course.id)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            {course.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CourseFormDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                course={editingCourse}
            />
        </div>
    );
}
