"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface CohortDeleteDialogProps {
  cohort: {
    _id: Id<"cohorts">;
    name: string;
  } | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

const defaultCohort = { _id: "" as Id<"cohorts">, name: "" };

export function CohortDeleteDialog({
  cohort,
  onOpenChange,
  onDeleted,
}: CohortDeleteDialogProps) {
  const deleteMutation = useMutation(api.cohorts.remove);
  const [isDeleting, setIsDeleting] = useState(false);

  const cohortData = cohort ?? defaultCohort;

  const handleConfirm = async () => {
    if (!cohort) return;
    setIsDeleting(true);

    const res = await deleteMutation({ cohortId: cohort._id });
    if (res.success) {
      toast.success(`Cohort "${cohort.name}" deleted.`);
      onOpenChange(false);
      onDeleted?.();
    } else {
      toast.error(res.error || "Failed to delete cohort.");
    }
    setIsDeleting(false);
  };

  return (
    <DeleteConfirmationDialog
      open={!!cohort}
      onOpenChange={onOpenChange}
      title="Cohort"
      itemName={cohortData.name}
      warningMessage="Deleting a cohort is permanent. Enrolled students will need to be reassigned to another cohort."
      onConfirm={handleConfirm}
      isDeleting={isDeleting}
    />
  );
}
