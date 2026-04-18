"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { FaqDialog } from "~/components/admin/dialogs/FaqDialog";
import { LinkFaqsSheet } from "~/components/admin/dialogs/LinkFaqsSheet";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface Faq {
  _id: Id<"faqs">;
  question: string;
  answer: string;
}

interface FAQsSectionProps {
  courseId: Id<"courses">;
}

export function FAQsSection({ courseId }: FAQsSectionProps) {
  const courseResult = useQuery(api.courses.getById, { courseId });
  const allFaqsResult = useQuery(api.faqs.list);
  const linkedFaqsResult = useQuery(api.faqs.listByIds, {
    faqIds: courseResult?.success ? (courseResult.data?.faqIds ?? []) : [],
  });
  const updateCourseFaqs = useMutation(api.courses.update);
  const createFaq = useMutation(api.faqs.create);

  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [showLinkFaqSheet, setShowLinkFaqSheet] = useState(false);

  const course = courseResult?.success ? courseResult.data : null;
  const allFaqs = allFaqsResult?.success ? allFaqsResult.data : [];
  const linkedFaqs = linkedFaqsResult?.success ? linkedFaqsResult.data : [];

  const availableFaqs = allFaqs.filter(
    (faq) => !(course?.faqIds ?? []).includes(faq._id),
  );

  const handleLinkFaq = async (faqId: Id<"faqs">) => {
    if (!course) return;
    const newFaqIds = [...(course.faqIds ?? []), faqId];
    try {
      const res = await updateCourseFaqs({ courseId, faqIds: newFaqIds });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ linked");
        setShowLinkFaqSheet(false);
      }
    } catch (error) {
      toast.error("Failed to link FAQ");
    }
  };

  const handleUnlinkFaq = async (faqId: Id<"faqs">) => {
    if (!course) return;
    const newFaqIds = (course.faqIds ?? []).filter((id) => id !== faqId);
    try {
      const res = await updateCourseFaqs({ courseId, faqIds: newFaqIds });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ unlinked");
      }
    } catch (error) {
      toast.error("Failed to unlink FAQ");
    }
  };

  const handleCreateFaq = async (data: {
    question: string;
    answer: string;
  }) => {
    try {
      const res = await createFaq({
        question: data.question,
        answer: data.answer,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ created");
        const newFaqIds = [...(course?.faqIds ?? []), res.data];
        await updateCourseFaqs({ courseId, faqIds: newFaqIds });
        setShowFaqDialog(false);
      }
    } catch (error) {
      toast.error("Failed to create FAQ");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
        <Button size="sm" onClick={() => setShowLinkFaqSheet(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {linkedFaqs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500">
            No FAQs linked to this course yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {linkedFaqs.map((faq) => (
            <div
              key={faq._id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnlinkFaq(faq._id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FaqDialog
        isOpen={showFaqDialog}
        onOpenChange={setShowFaqDialog}
        onSubmit={handleCreateFaq}
      />

      <LinkFaqsSheet
        isOpen={showLinkFaqSheet}
        onOpenChange={setShowLinkFaqSheet}
        availableFaqs={availableFaqs}
        linkedFaqs={linkedFaqs}
        onLink={handleLinkFaq}
        onUnlink={handleUnlinkFaq}
        onCreateNew={() => {
          setShowLinkFaqSheet(false);
          setShowFaqDialog(true);
        }}
      />
    </div>
  );
}
