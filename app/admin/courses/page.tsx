"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Check,
  Edit,
  Eye,
  GripVertical,
  Link as LinkIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Power,
  PowerOff,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CourseFormDialog } from "~/components/admin/dialogs/CourseFormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

export default function CoursesPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<{
    _id: Id<"courses">;
    name: string;
    slug?: string;
    description: string;
    duration: string;
    certification: string;
    tuitionFee: number;
    coverPhoto?: string;
    isActive: boolean;
    instructorIds?: string[];
  } | null>(null);

  const coursesResult = useQuery(api.courses.listAll);
  const updateCourse = useMutation(api.courses.update);

  const openCreateDialog = () => {
    setEditingCourse(null);
    setShowDialog(true);
  };

  const openEditDialog = (course: NonNullable<typeof editingCourse>) => {
    setEditingCourse(course);
    setShowDialog(true);
  };

  const toggleActive = async (
    courseId: Id<"courses">,
    currentlyActive: boolean,
  ) => {
    const res = await updateCourse({ courseId, isActive: !currentlyActive });
    if (!res.success) {
      toast.error(res.error);
    }
  };

  const copyToClipboard = (course: any) => {
    let slug = course.slug;
    if (!slug) {
      // Fallback for older records without a slug saved in DB
      slug = course.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    const url = `${window.location.origin}/applications/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(course._id);
    toast.success("Application link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isLoading = coursesResult === undefined;
  const courses = coursesResult?.success ? coursesResult.data : [];

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
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : coursesResult.success === false ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-red-600 bg-red-50"
                  >
                    {coursesResult.error}
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No courses found. Add your first course to get started.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id}>
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
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          course.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {course.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white hover:bg-gray-100 text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          >
                            <span className="sr-only">Open options</span>
                            <MoreHorizontal
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(course)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(course)}
                          >
                            {copiedId === course._id ? (
                              <span className="flex items-center text-green-600">
                                <Check className="mr-2 h-4 w-4" />
                                Copied!
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Share Link
                              </span>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              toggleActive(course._id, course.isActive)
                            }
                            className={
                              course.isActive
                                ? "text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                                : "text-green-600 focus:text-green-600 focus:bg-green-50"
                            }
                          >
                            {course.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
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
