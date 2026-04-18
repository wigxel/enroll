"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { InstructorFormDialog } from "~/components/admin/dialogs/InstructorFormDialog";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface Instructor {
  _id: Id<"instructors">;
  name: string;
  title: string;
  bio: string;
  photo?: string;
}

interface InstructorsSectionProps {
  courseId: Id<"courses">;
}

export function InstructorsSection({ courseId }: InstructorsSectionProps) {
  const courseResult = useQuery(api.courses.getById, { courseId });
  const allInstructorsResult = useQuery(api.instructors.list);
  const updateCourse = useMutation(api.courses.update);

  const [showInstructorForm, setShowInstructorForm] = useState(false);

  const course = courseResult?.success ? courseResult.data : null;
  const allInstructors = allInstructorsResult?.success
    ? allInstructorsResult.data
    : [];
  const instructorIds: Id<"instructors">[] = course?.instructors ?? [];

  const linkedInstructors = allInstructors.filter((inst) =>
    instructorIds.includes(inst._id),
  );

  const availableInstructors = allInstructors.filter(
    (inst) => !instructorIds.includes(inst._id),
  );

  const handleLinkInstructor = async (instructorId: Id<"instructors">) => {
    const newInstructorIds = [...instructorIds, instructorId];
    try {
      const res = await updateCourse({
        courseId,
        instructorIds: newInstructorIds,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Instructor linked");
      }
    } catch (error) {
      toast.error("Failed to link instructor");
    }
  };

  const handleUnlinkInstructor = async (instructorId: Id<"instructors">) => {
    const newInstructorIds = instructorIds.filter((id) => id !== instructorId);
    try {
      const res = await updateCourse({
        courseId,
        instructorIds: newInstructorIds,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Instructor unlinked");
      }
    } catch (error) {
      toast.error("Failed to unlink instructor");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Instructors</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInstructorForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Link Existing
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableInstructors.length === 0 ? (
                <DropdownMenuItem disabled>
                  No available instructors
                </DropdownMenuItem>
              ) : (
                availableInstructors.map((inst) => (
                  <DropdownMenuItem
                    key={inst._id}
                    onClick={() => handleLinkInstructor(inst._id)}
                  >
                    {inst.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {linkedInstructors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500">
            No instructors linked to this course yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {linkedInstructors.map((instructor) => (
            <div
              key={instructor._id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                {instructor.photo ? (
                  <img
                    src={instructor.photo}
                    alt={instructor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    {instructor.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{instructor.name}</p>
                <p className="text-sm text-gray-500">{instructor.title}</p>
              </div>
              <button
                type="button"
                onClick={() => handleUnlinkInstructor(instructor._id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <InstructorFormDialog
        open={showInstructorForm}
        onOpenChange={setShowInstructorForm}
      />
    </div>
  );
}
