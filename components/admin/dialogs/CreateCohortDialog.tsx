"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface CohortFormData {
  name: string;
  startDate: string;
  endDate: string;
  capacity: string;
}

interface CohortFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohort?: {
    _id: Id<"cohorts">;
    name: string;
    startDate: string;
    endDate: string;
    capacity?: number;
  } | null;
  onSuccess?: () => void;
}

const emptyForm: CohortFormData = {
  name: "",
  startDate: "",
  endDate: "",
  capacity: "",
};

export function CohortFormDialog({
  open,
  onOpenChange,
  cohort,
  onSuccess,
}: CohortFormDialogProps) {
  const [formData, setFormData] = useState<CohortFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCohort = useMutation(api.cohorts.create);
  const updateCohort = useMutation(api.cohorts.update);

  const isEditing = !!cohort;

  useEffect(() => {
    if (cohort) {
      setFormData({
        name: cohort.name,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        capacity: cohort.capacity?.toString() ?? "",
      });
    } else {
      setFormData(emptyForm);
    }
    setError(null);
  }, [cohort]);

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const capacity = formData.capacity
        ? parseInt(formData.capacity, 10)
        : undefined;

      if (isEditing && cohort) {
        const res = await updateCohort({
          cohortId: cohort._id,
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          capacity,
        });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createCohort({
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          capacity,
        });
        if (!res.success) throw new Error(res.error);
      }

      setFormData(emptyForm);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Cohort" : "Create New Cohort"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="cohort-name"
              className="block text-sm font-medium text-gray-700"
            >
              Cohort Name
            </label>
            <input
              id="cohort-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Spring 2027 Software Engineering"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cohort-start"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                id="cohort-start"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="cohort-end"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                id="cohort-end"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="cohort-capacity"
              className="block text-sm font-medium text-gray-700"
            >
              Capacity (optional)
            </label>
            <input
              id="cohort-capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              placeholder="e.g., 30"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={
              !formData.name ||
              !formData.startDate ||
              !formData.endDate ||
              isSubmitting
            }
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Cohort"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
