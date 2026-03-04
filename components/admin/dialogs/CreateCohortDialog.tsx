"use client";

import React, { useState, useEffect } from "react";
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

interface Cohort {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    capacity: number | null;
}

interface CohortFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cohort?: Cohort | null;
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
    }, [cohort]);

    const handleSave = () => {
        if (isEditing) {
            // TODO: call cohorts.update({ id: cohort.id, ...formData })
            console.log("Update cohort", cohort?.id, formData);
        } else {
            // TODO: call cohorts.create(formData)
            console.log("Create cohort", formData);
        }
        setFormData(emptyForm);
        onOpenChange(false);
        onSuccess?.();
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
                        <label className="block text-sm font-medium text-gray-700">
                            Cohort Name
                        </label>
                        <input
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
                            <label className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <input
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
                        <label className="block text-sm font-medium text-gray-700">
                            Capacity (optional)
                        </label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData({ ...formData, capacity: e.target.value })
                            }
                            placeholder="e.g., 30"
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
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
                            !formData.name || !formData.startDate || !formData.endDate
                        }
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isEditing ? "Save Changes" : "Create Cohort"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
