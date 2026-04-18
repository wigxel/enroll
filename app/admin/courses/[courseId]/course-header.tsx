"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface CourseHeaderProps {
  courseId: Id<"courses">;
}

export function CourseHeader({ courseId }: CourseHeaderProps) {
  const router = useRouter();
  const courseResult = useQuery(api.courses.getById, { courseId });
  const updateCourse = useMutation(api.courses.update);

  const course = courseResult?.success ? courseResult.data : null;

  const toggleActive = async () => {
    if (!course) return;
    try {
      const res = await updateCourse({
        courseId,
        isActive: !course.isActive,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success(
          course.isActive ? "Course deactivated" : "Course activated",
        );
      }
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  if (!course) return null;

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => router.push("/admin/courses")}
        className="mb-4 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </button>

      <div className="flex items-start gap-6">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-200">
          {course.coverPhoto ? (
            <img
              src={course.coverPhoto}
              alt={course.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={course.isActive ? "default" : "outline"}
                  size="sm"
                >
                  {course.isActive ? "Active" : "Inactive"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => updateCourse({ courseId, isActive: true })}
                >
                  Set Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateCourse({ courseId, isActive: false })}
                >
                  Set Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={toggleActive}>
              {course.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
