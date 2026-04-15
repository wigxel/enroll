"use client";

import { useQuery } from "convex/react";
import { ChevronDown } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface FaqSectionProps {
  courseId: string;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
        {question}
        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180 shrink-0 ml-4" />
      </summary>
      <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}

export function FaqSection({ courseId }: FaqSectionProps) {
  const faqsResult = useQuery(api.courses.getCourseFaqs, {
    courseId: courseId as Id<"courses">,
  });
  const faqs = faqsResult?.success ? faqsResult.data : [];

  if (faqsResult === undefined) {
    return (
      <div className="mt-6 animate-pulse h-32 bg-gray-100 rounded-2xl dark:bg-zinc-800" />
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-100 bg-background p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No FAQs available for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 divide-y divide-gray-100 dark:divide-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background overflow-hidden dark:bg-zinc-900">
      {faqs.map((faq: any) => (
        <FaqItem key={faq._id} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
}
