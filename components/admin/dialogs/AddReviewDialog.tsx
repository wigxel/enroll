"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CourseCombobox } from "~/components/fields/CourseCombobox";
import { StudentCombobox } from "~/components/fields/StudentCombobox";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { api } from "~/convex/_generated/api";

const reviewSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  courseId: z.string().optional(),
  rating: z.number().min(1, "Please select a rating"),
  text: z.string().min(10, "Review must be at least 10 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const defaultState: ReviewFormValues = {
  studentId: "",
  courseId: "",
  rating: 0,
  text: "",
};

export function AddReviewDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddReviewDialogProps) {
  const [ratingHover, setRatingHover] = useState(0);

  const createAdminReview = useMutation(api.reviews.createAdminReview);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: defaultState,
  });

  const { handleSubmit, reset, setValue, watch, formState } = form;
  const { isSubmitting, errors } = formState;

  const watchRating = watch("rating");
  const watchStudentId = watch("studentId");
  const watchCourseId = watch("courseId");
  const watchText = watch("text");

  useEffect(() => {
    if (open) {
      reset(defaultState);
    }
  }, [open, reset]);

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      const res = await createAdminReview({
        userId: data.studentId as any,
        courseId: data.courseId ? (data.courseId as any) : undefined,
        rating: data.rating,
        text: data.text,
      });

      if (!res.success) throw new Error(res.error);

      toast.success("Review created successfully");
      reset(defaultState);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset(defaultState);
    }
    onOpenChange(isOpen);
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Review</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Student *
            </label>
            <StudentCombobox
              value={watchStudentId || null}
              onChange={(val) =>
                setValue("studentId", val ?? "", { shouldValidate: true })
              }
            />
            {errors.studentId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.studentId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Course{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <CourseCombobox
              value={watchCourseId || null}
              onChange={(val) =>
                setValue("courseId", val ?? "", { shouldValidate: true })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rating *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setValue("rating", star, { shouldValidate: true })
                  }
                  onMouseEnter={() => setRatingHover(star)}
                  onMouseLeave={() => setRatingHover(0)}
                  className="focus:outline-none"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (ratingHover || watchRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 hover:text-amber-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {watchRating === 0 ? "Click to rate" : ratingLabels[watchRating]}
            </p>
            {errors.rating && (
              <p className="mt-1 text-xs text-red-600">
                {errors.rating.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="review-text"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Review *
            </label>
            <textarea
              id="review-text"
              rows={4}
              value={watchText}
              onChange={(e) =>
                setValue("text", e.target.value, { shouldValidate: true })
              }
              disabled={isSubmitting}
              placeholder="Share your feedback about this student's experience..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 10 characters ({(watchText || "").trim().length}/10)
            </p>
            {errors.text && (
              <p className="mt-1 text-xs text-red-600">{errors.text.message}</p>
            )}
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Review"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
