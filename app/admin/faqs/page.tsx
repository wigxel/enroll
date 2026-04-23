"use client";

import { useMutation, useQuery } from "convex/react";
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { Reorder } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { FaqDialog } from "~/components/admin/dialogs/FaqDialog";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { safeArray } from "~/lib/data.helpers";

interface FAQ {
  _id: Id<"faqs">;
  _creationTime: number;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function FAQItem({
  faq,
  onEdit,
  onDelete,
}: {
  faq: FAQ;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Reorder.Item
      value={faq}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{faq.question}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
      </div>
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${
          faq.isActive
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {faq.isActive ? "Active" : "Inactive"}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
}

export default function FaqsPage() {
  const faqsResult = useQuery(api.faqs.list);
  const createFaq = useMutation(api.faqs.create);
  const updateFaq = useMutation(api.faqs.update);
  const deleteFaq = useMutation(api.faqs.deleteFaq);
  const reorderFaqs = useMutation(api.faqs.reorder);

  const [showDialog, setShowDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [localFaqs, setLocalFaqs] = useState<FAQ[]>([]);

  const faqs = faqsResult?.success ? faqsResult.data : [];
  const isLoading = faqsResult === undefined;

  if (!isLoading && localFaqs.length === 0 && faqs.length > 0) {
    setLocalFaqs([...faqs]);
  }

  const handleCreate = async (data: { question: string; answer: string }) => {
    try {
      const res = await createFaq({
        question: data.question,
        answer: data.answer,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ created");
        setShowDialog(false);
      }
    } catch (error) {
      toast.error("Failed to create FAQ");
    }
  };

  const handleUpdate = async (data: { question: string; answer: string }) => {
    if (!editingFaq) return;
    try {
      const res = await updateFaq({
        faqId: editingFaq._id,
        question: data.question,
        answer: data.answer,
        isActive: editingFaq.isActive,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ updated");
        setShowDialog(false);
        setEditingFaq(null);
      }
    } catch (error) {
      toast.error("Failed to update FAQ");
    }
  };

  const handleDelete = async (faqId: Id<"faqs">) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await deleteFaq({ faqId });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ deleted");
      }
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleReorder = async (newOrder: FAQ[]) => {
    setLocalFaqs(newOrder);
    const orderedIds = newOrder.map((f) => f._id);
    try {
      const res = await reorderFaqs({ orderedIds });
      if (!res.success) {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Failed to reorder FAQs");
    }
  };

  React.useEffect(() => {
    if (!faqsResult?.success) return;
    setLocalFaqs(safeArray(faqsResult?.data));
  }, [faqsResult]);

  const handleOpenChange = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      // Small delay to prevent layout shift during close animation
      setTimeout(() => setEditingFaq(null), 300);
    }
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Manage FAQs</h1>
          <FaqDialog
            isOpen={showDialog}
            onOpenChange={handleOpenChange}
            isEdit={editingFaq !== null}
            initialFormData={editingFaq ?? undefined}
            onSubmit={editingFaq ? handleUpdate : handleCreate}
          >
            <Button onClick={() => setEditingFaq(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New FAQ
            </Button>
          </FaqDialog>
        </div>

        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">No FAQs yet. Add your first one!</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={localFaqs}
            onReorder={handleReorder}
            className="mt-6 space-y-2"
          >
            {localFaqs.map((faq) => (
              <FAQItem
                key={faq._id}
                faq={faq}
                onEdit={() => {
                  setEditingFaq(faq);
                  setShowDialog(true);
                }}
                onDelete={() => handleDelete(faq._id)}
              />
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
