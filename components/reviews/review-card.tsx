"use client";

import { Check, Loader2, Star, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { EnrichedReview } from "~/convex/reviews";
import { cn } from "~/lib/utils";

interface ReviewCardProps {
  review: EnrichedReview;
  isProcessing: string | null;
  onApprove: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  isProcessing,
  onApprove,
  onDelete,
}: ReviewCardProps) {
  const initials = review.userName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </div>
            <div>
              <div className="font-medium text-gray-900">{review.userName}</div>
              <div className="text-xs text-gray-500">{review.userEmail}</div>
            </div>
            <span
              className={cn(
                "ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                review.isApproved
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700",
              )}
            >
              {review.isApproved ? "Approved" : "Pending"}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300",
                )}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {review.rating}/5
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-600">{review.text}</p>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span>Course:</span>
            <span className="font-medium text-gray-700">
              {review.courseName}
            </span>
            <span className="mx-1">·</span>
            <span>
              Submitted{" "}
              {new Date(review._creationTime).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-2">
          {!review.isApproved && (
            <Button
              variant="default"
              onClick={() => onApprove(review._id)}
              disabled={isProcessing === review._id}
            >
              {isProcessing === review._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-destructive"
            onClick={() => onDelete(review._id)}
            disabled={isProcessing === review._id}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
