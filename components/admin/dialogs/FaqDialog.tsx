"use client";

import { useState } from "react";
import { FaqForm } from "~/components/admin/forms/FaqForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  children?: React.ReactNode;
}

export function FaqDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialFormData,
  isEdit = false,
  children,
}: FaqDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleSubmit = async (data: { question: string; answer: string }) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

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
