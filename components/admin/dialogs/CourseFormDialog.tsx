"use client";

import { useMutation, useQuery } from "convex/react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { FileUpload } from "~/components/ui/file-upload";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface CourseFormData {
  name: string;
  slug: string;
  description: string;
  duration: string;
  certification: string;
  tuitionFee: string;
  coverPhoto: string | undefined;
  isActive: boolean;
}

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: {
    _id: Id<"courses">;
    name: string;
    slug?: string;
    description: string;
    duration: string;
    certification: string;
    tuitionFee: number;
    coverPhoto?: string;
    isActive: boolean;
  } | null;
  onSuccess?: () => void;
}

const emptyForm: CourseFormData = {
  name: "",
  slug: "",
  description: "",
  duration: "",
  certification: "",
  tuitionFee: "",
  coverPhoto: undefined,
  isActive: true,
};

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onSuccess,
}: CourseFormDialogProps) {
  const [formData, setFormData] = useState<CourseFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugModified, setSlugModified] = useState(false);

  const createCourse = useMutation(api.courses.create);
  const updateCourse = useMutation(api.courses.update);

  const isEditing = !!course;

  // Resolve existing cover photo storage ID → URL for preview in edit mode
  const photoResult = useQuery(
    api.storage.getFileUrl,
    course?.coverPhoto
      ? { storageId: course.coverPhoto as Id<"_storage"> }
      : "skip",
  );
  const existingCoverPhotoUrl = photoResult?.success ? photoResult.data : null;

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        slug: course.slug || "",
        description: course.description,
        duration: course.duration,
        certification: course.certification,
        tuitionFee: course.tuitionFee.toString(),
        coverPhoto: course.coverPhoto,
        isActive: course.isActive,
      });
      setSlugModified(false);
    } else {
      setFormData(emptyForm);
      setSlugModified(false);
    }
    setError(null);
  }, [course]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;

    // Only auto-update the slug if the user hasn't explicitly customized it
    if (!slugModified) {
      const generatedSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData({ ...formData, name: newName, slug: generatedSlug });
    } else {
      setFormData({ ...formData, name: newName });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugModified(true);
    setFormData({ ...formData, slug: e.target.value });
  };

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const tuitionFee = parseFloat(formData.tuitionFee);
      // Auto-generate slug from name if empty
      const finalSlug =
        formData.slug.trim() ||
        formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      if (isEditing && course) {
        const res = await updateCourse({
          courseId: course._id,
          name: formData.name,
          slug: finalSlug,
          description: formData.description,
          duration: formData.duration,
          certification: formData.certification,
          coverPhoto: formData.coverPhoto,
          tuitionFee,
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createCourse({
          name: formData.name,
          slug: finalSlug,
          description: formData.description,
          duration: formData.duration,
          certification: formData.certification,
          coverPhoto: formData.coverPhoto,
          tuitionFee,
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
      }

      setFormData(emptyForm);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Course" : "Add New Course"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="course-name"
              className="block text-sm font-medium text-gray-700"
            >
              Course Name *
            </label>
            <input
              id="course-name"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="course-slug"
              className="block text-sm font-medium text-gray-700"
            >
              URL Slug (auto-generated if empty)
            </label>
            <input
              id="course-slug"
              type="text"
              placeholder="e.g., software-engineering"
              value={formData.slug}
              onChange={handleSlugChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="course-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="course-description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="course-duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration *
              </label>
              <input
                id="course-duration"
                type="text"
                placeholder="e.g., 12 Weeks"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="course-fee"
                className="block text-sm font-medium text-gray-700"
              >
                Tuition Fee (₦) *
              </label>
              <input
                id="course-fee"
                type="number"
                value={formData.tuitionFee}
                onChange={(e) =>
                  setFormData({ ...formData, tuitionFee: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="course-certification"
              className="block text-sm font-medium text-gray-700"
            >
              Certification *
            </label>
            <input
              id="course-certification"
              type="text"
              value={formData.certification}
              onChange={(e) =>
                setFormData({ ...formData, certification: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cover Photo
            </label>
            <FileUpload
              className="mt-1"
              onUploadComplete={(storageId) =>
                setFormData({ ...formData, coverPhoto: storageId })
              }
              onRemove={() =>
                setFormData({ ...formData, coverPhoto: undefined })
              }
              previewUrl={existingCoverPhotoUrl}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${formData.isActive ? "bg-primary" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
            <span className="text-sm text-gray-700">Active</span>
          </div>
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={
              !formData.name ||
              !formData.description ||
              !formData.duration ||
              !formData.tuitionFee ||
              !formData.certification ||
              isSubmitting
            }
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Course"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
