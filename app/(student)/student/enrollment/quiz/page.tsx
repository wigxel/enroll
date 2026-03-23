"use client";

import {
  ArrowLeft,
  BookOpen,
  Clock,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function QuizLandingPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-2xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/student/enrollment"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Checklist
          </Link>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header Banner */}
          <div className="bg-primary/5 px-8 py-10 text-center border-b border-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
              Orientation Quiz
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Demonstrate your readiness by completing the final orientation
              step.
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="grid gap-8 sm:grid-cols-3">
              {/* Detail Item 1 */}
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  5 Questions
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Multiple choice questions covering core policies and code of
                  conduct.
                </p>
              </div>

              {/* Detail Item 2 */}
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  80% to Pass
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  You must answer at least 4 out of 5 questions correctly to
                  proceed.
                </p>
              </div>

              {/* Detail Item 3 */}
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Unlimited Retakes
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Take your time. If you don't pass, you can try again
                  immediately.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-gray-100" />

            {/* Action Area */}
            <div className="flex flex-col items-center justify-center">
              <p className="mb-6 text-center text-sm text-gray-500">
                Ready to begin? The quiz will open in this window.
              </p>
              <Link
                href="/student/enrollment/quiz/take"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow active:scale-[0.98]"
              >
                <PlayCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                Start the Quiz Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
