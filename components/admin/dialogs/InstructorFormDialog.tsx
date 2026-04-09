"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileUpload } from "~/components/ui/file-upload";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

const instructorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  photo: z.string().optional(),
});

type InstructorFormValues = z.infer<typeof instructorSchema>;

interface InstructorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor?: {
    _id: Id<"instructors">;
    name: string;
    title: string;
    bio: string;
    photo?: string;
  } | null;
  onSuccess?: () => void;
}

const defaultState: InstructorFormValues = {
  name: "",
  title: "",
  bio: "",
  photo: undefined,
};

export function InstructorFormDialog({
  open,
  onOpenChange,
  instructor,
  onSuccess,
}: InstructorFormDialogProps) {
  const createInstructor = useMutation(api.instructors.create);
  const updateInstructor = useMutation(api.instructors.update);

  const isEditing = !!instructor;

  const photoResult = useQuery(
    api.storage.getFileUrl,
    instructor?.photo
      ? { storageId: instructor.photo as Id<"_storage"> }
      : "skip",
  );
  const existingPhotoUrl = photoResult?.success ? photoResult.data : null;

  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorSchema),
    defaultValues: defaultState,
  });

  const { register, handleSubmit, reset, setValue, formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: InstructorFormValues) => {
    try {
      if (isEditing && instructor) {
        const res = await updateInstructor({
          instructorId: instructor._id,
          name: data.name,
          title: data.title,
          bio: data.bio,
          photo: data.photo,
        });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createInstructor({
          name: data.name,
          title: data.title,
          bio: data.bio,
          photo: data.photo,
        });
        if (!res.success) throw new Error(res.error);
      }

      reset(defaultState);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset(defaultState);
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Instructor" : "Add New Instructor"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Lead Instructor"
              {...register("title")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              Bio *
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register("bio")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {form.formState.errors.bio && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700">
              Photo
            </span>
            <FileUpload
              className="mt-1"
              onUploadComplete={(storageId) =>
                setValue("photo", storageId, { shouldValidate: true })
              }
              onRemove={() => setValue("photo", undefined)}
              previewUrl={existingPhotoUrl}
              disabled={isSubmitting}
            />
          </div>

          <SheetFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Instructor"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
