"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, Loader2, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";

export default function ReviewsPage() {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const pendingRaw = useQuery(api.reviews.listPending);
  const pending = pendingRaw?.success ? pendingRaw.data : [];
  const isLoading = pendingRaw === undefined;

  const approveMutation = useMutation(api.reviews.approve);
  const deleteMutation = useMutation(api.reviews.deleteReview);

  const handleApprove = async (reviewId: string) => {
    setIsProcessing(reviewId);
    await approveMutation({ reviewId: reviewId as any });
    setIsProcessing(null);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setIsProcessing(reviewId);
    await deleteMutation({ reviewId: reviewId as any });
    setIsProcessing(null);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pending.length} pending review{pending.length !== 1 ? "s" : ""}{" "}
            awaiting approval
          </p>
        </div>

        {/* Pending Reviews */}
        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : pending.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <Star className="h-8 w-8 text-gray-300" />
            <h3 className="mt-3 text-sm font-medium text-gray-900">
              No pending reviews
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              All reviews have been processed.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {pending.map((review) => (
              <div
                key={review._id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {review.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.userName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.userEmail}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
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
                        {new Date(review._creationTime).toLocaleDateString(
                          "en-NG",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="default"
                      onClick={() => handleApprove(review._id)}
                      disabled={isProcessing === review._id}
                    >
                      {isProcessing === review._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(review._id)}
                      disabled={isProcessing === review._id}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
