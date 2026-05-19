"use client";

import { RiCheckDoubleFill } from "@remixicon/react";
import { Clock, Mail, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function ApplicationUnderReviewPage() {
  return (
    <div className="flex flex-1 items-start justify-center px-4 sm:px-6">
      <div className="w-full max-w-lg">
        {/* Progress breadcrumb */}
        <div className="mb-8 flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-400">Application</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">Payment</span>
          <span className="text-gray-300">→</span>
          <span className="font-semibold text-primary">Under Review</span>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <RiCheckDoubleFill className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            Payment Successful
          </h1>

          <p className="mt-2 text-xs text-gray-600 text-balance">
            Thank you! Application is now under review.
          </p>

          {/* What happens next */}
          <div className="mt-8 text-left">
            <h2 className="text-sm font-semibold font-sans! text-gray-900 mb-4">
              What happens next?
            </h2>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Admissions Review
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Our admissions team will review your application within 3–5
                    business days.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-50">
                  <Mail className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Email Notification
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    You'll receive an email with our decision and next steps
                    once the review is complete.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <RefreshCcw className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Refund Guarantee
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    If your application is not approved, your application fee
                    will be automatically refunded to your original payment
                    method.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Action */}
          <div className="mt-10">
            <Link href="/student/courses">
              <Button className="w-full" size="lg">
                View Application Status
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
