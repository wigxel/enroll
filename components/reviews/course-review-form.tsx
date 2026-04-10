"use client";

import { useMutation, useQuery } from "convex/react";
import { Star } from "lucide-react";
import { useState } from "react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface CourseReviewFormProps {
  courseId: Id<"courses">;
  courseName: string;
  onSuccess?: () => void;
}

export function CourseReviewForm({
  courseId,
  courseName,
  onSuccess,
}: CourseReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const userReview = useQuery(api.reviews.getUserReviewForCourse, {
    courseId,
  });
  const createReview = useMutation(api.reviews.createReview);

  const hasExistingReview = userReview?.success && userReview.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (text.trim().length < 10) {
      setError("Please write at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createReview({
        courseId,
        rating,
        text: text.trim(),
      });

      if (!res.success) {
        setError(res.error || "Failed to submit review");
        return;
      }

      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Star className="h-5 w-5 text-green-600 fill-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">
              Thank you for your review!
            </h3>
            <p className="text-sm text-green-700">
              Your feedback helps future students make informed decisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasExistingReview) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Star className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">
              You have already reviewed this course
            </h3>
            <p className="text-sm text-gray-500">
              Thank you for your feedback!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        How was your experience?
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Share your feedback about the {courseName} course
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Star Rating */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700">
            Your Rating
          </legend>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                disabled={isSubmitting}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300 hover:text-amber-200"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {rating === 0
              ? "Click to rate"
              : rating === 5
                ? "Excellent!"
                : rating === 4
                  ? "Great"
                  : rating === 3
                    ? "Good"
                    : rating === 2
                      ? "Fair"
                      : "Poor"}
          </p>
        </fieldset>

        {/* Review Text */}
        <div>
          <label
            htmlFor="review-text"
            className="block text-sm font-medium text-gray-700"
          >
            Your Review
          </label>
          <textarea
            id="review-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            placeholder="Share your experience with this course..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum 10 characters ({text.trim().length}/10)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-xs text-red-700">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || text.trim().length < 10}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
