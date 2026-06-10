"use client";

import { useMutation, useQuery } from "convex/react";
import { Filter, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { AddReviewDialog } from "~/components/admin/dialogs/AddReviewDialog";
import { CourseCombobox } from "~/components/fields/CourseCombobox";
import { ReviewCard } from "~/components/reviews/review-card";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";

type StatusFilter = "all" | "approved" | "pending";

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
];

export default function ReviewsPage() {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [courseFilter, setCourseFilter] = useState<Id<"courses"> | null>(null);

  const resultRaw = useQuery(api.reviews.listAll, {
    courseId: courseFilter ?? undefined,
    isApproved:
      statusFilter === "all" ? undefined : statusFilter === "approved",
  });
  const reviews = resultRaw?.success ? resultRaw.data : [];
  const isLoading = resultRaw === undefined;

  const approveMutation = useMutation(api.reviews.approve);
  const deleteMutation = useMutation(api.reviews.deleteReview);

  const handleApprove = async (reviewId: string) => {
    setIsProcessing(reviewId);
    await approveMutation({ reviewId: reviewId as Id<"reviews"> });
    setIsProcessing(null);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setIsProcessing(reviewId);
    await deleteMutation({ reviewId: reviewId as Id<"reviews"> });
    setIsProcessing(null);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
            <p className="mt-1 text-sm text-gray-500">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Review
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === pill.key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Course:</span>
            <button
              type="button"
              onClick={() => setCourseFilter(null)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                courseFilter === null
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              All
            </button>
            <div className="w-64">
              <CourseCombobox
                value={courseFilter}
                onChange={(val) => setCourseFilter(val as Id<"courses"> | null)}
                placeholder="Filter by course..."
                clearable
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : resultRaw?.success === false ? (
          <div className="mt-12 rounded-lg bg-red-50 p-4 text-center text-red-600">
            {resultRaw.error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <Filter className="h-8 w-8 text-gray-300" />
            <h3 className="mt-3 text-sm font-medium text-gray-900">
              No reviews found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                isProcessing={isProcessing}
                onApprove={handleApprove}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AddReviewDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
