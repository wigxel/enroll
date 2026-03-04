"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";

interface CourseFormData {
    name: string;
    description: string;
    duration: string;
    certification: string;
    tuitionFee: string;
    isActive: boolean;
}

interface Course {
    id: string;
    name: string;
    description: string;
    duration: string;
    certification: string;
    tuitionFee: number;
    isActive: boolean;
}

interface CourseFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course?: Course | null;
    onSuccess?: () => void;
}

const emptyForm: CourseFormData = {
    name: "",
    description: "",
    duration: "",
    certification: "",
    tuitionFee: "",
    isActive: true,
};

export function CourseFormDialog({
    open,
    onOpenChange,
    course,
    onSuccess,
}: CourseFormDialogProps) {
    const [formData, setFormData] = useState<CourseFormData>(emptyForm);
    const isEditing = !!course;

    useEffect(() => {
        if (course) {
            setFormData({
                name: course.name,
                description: course.description,
                duration: course.duration,
                certification: course.certification,
                tuitionFee: course.tuitionFee.toString(),
                isActive: course.isActive,
            });
        } else {
            setFormData(emptyForm);
        }
    }, [course]);

    const handleSave = () => {
        if (isEditing) {
            // TODO: call courses.update({ id: course.id, ...formData })
            console.log("Update course", course?.id, formData);
        } else {
            // TODO: call courses.create(formData)
            console.log("Create course", formData);
        }
        setFormData(emptyForm);
        onOpenChange(false);
        onSuccess?.();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Course" : "Add New Course"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Course Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description *
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Duration *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 12 Weeks"
                                value={formData.duration}
                                onChange={(e) =>
                                    setFormData({ ...formData, duration: e.target.value })
                                }
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Tuition Fee (₦) *
                            </label>
                            <input
                                type="number"
                                value={formData.tuitionFee}
                                onChange={(e) =>
                                    setFormData({ ...formData, tuitionFee: e.target.value })
                                }
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Certification *
                        </label>
                        <input
                            type="text"
                            value={formData.certification}
                            onChange={(e) =>
                                setFormData({ ...formData, certification: e.target.value })
                            }
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Cover Photo
                        </label>
                        <div className="mt-1 flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-4">
                            <p className="text-sm text-gray-500">
                                Click or drag to upload (Convex storage)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setFormData({ ...formData, isActive: !formData.isActive })
                            }
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${formData.isActive ? "bg-primary" : "bg-gray-200"
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? "translate-x-5" : "translate-x-0"
                                    }`}
                            />
                        </button>
                        <span className="text-sm text-gray-700">Active</span>
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
                            !formData.name ||
                            !formData.description ||
                            !formData.duration ||
                            !formData.tuitionFee ||
                            !formData.certification
                        }
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isEditing ? "Save Changes" : "Create Course"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
