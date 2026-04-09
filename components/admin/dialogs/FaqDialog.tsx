"use client";

import { useState } from "react";
import { FaqForm } from "~/components/admin/forms/FaqForm";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

interface FaqDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: { question: string; answer: string }) => void;
  initialFormData?: {
    question: string;
    answer: string;
  };
  isEdit?: boolean;
  children: React.ReactNode;
}

export function FaqDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialFormData,
  isEdit = false,
  children,
}: FaqDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: { question: string; answer: string }) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit FAQ" : "Create New FAQ"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the question and answer below."
              : "Add a new frequently asked question."}
          </DialogDescription>
        </DialogHeader>

        <FaqForm
          initialFormData={initialFormData}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
