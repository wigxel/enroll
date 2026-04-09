"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { InstructorFormDialog } from "~/components/admin/dialogs/InstructorFormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

export default function InstructorsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<{
    _id: Id<"instructors">;
    name: string;
    title: string;
    bio: string;
    photo?: string;
  } | null>(null);

  const instructorsResult = useQuery(api.instructors.list);
  const deleteInstructor = useMutation(api.instructors.deleteInstructor);

  const instructors = instructorsResult?.success
    ? (instructorsResult.data as any[])
    : [];
  const isLoading = instructorsResult === undefined;

  const openCreateDialog = () => {
    setEditingInstructor(null);
    setShowDialog(true);
  };

  const openEditDialog = (
    instructor: NonNullable<typeof editingInstructor>,
  ) => {
    setEditingInstructor(instructor);
    setShowDialog(true);
  };

  const handleDelete = async (instructorId: Id<"instructors">) => {
    if (!confirm("Are you sure you want to delete this instructor?")) return;

    const res = await deleteInstructor({ instructorId });
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success("Instructor deleted successfully");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage course instructors
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Instructor
          </button>
        </div>

        {instructors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <User className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              No instructors yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by adding a new instructor.
            </p>
            <button
              type="button"
              onClick={openCreateDialog}
              className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Instructor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((instructor) => (
              <div
                key={instructor._id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative h-32 bg-gradient-to-br from-indigo-500 to-purple-600">
                  {instructor.photo ? (
                    <Image
                      src={instructor.photo}
                      alt={instructor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <User className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 hover:bg-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(instructor)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(instructor._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">
                    {instructor.name}
                  </h3>
                  <p className="text-sm text-primary">{instructor.title}</p>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {instructor.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <InstructorFormDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          instructor={editingInstructor}
          onSuccess={() => {
            setEditingInstructor(null);
          }}
        />
      </div>
    </div>
  );
}
