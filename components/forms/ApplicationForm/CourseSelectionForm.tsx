"use client";

import React, { useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Id } from "@/convex/_generated/dataModel";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { useDebounceCallback } from "~/hooks/use-debounce-callback";

export const courseSelectionSchema = z.object({
  courseId: z.string().min(1, "Please select a course to enroll in"),
});

export type CourseSelectionValues = z.infer<typeof courseSelectionSchema>;

export const defaultCourseSelectionState: CourseSelectionValues = {
  courseId: "",
};

export interface CourseSelectionFormProps {
  initialFormData?: Partial<CourseSelectionValues>;
  isLoading?: boolean;
  onSubmit: (data: CourseSelectionValues) => void;
  onBack?: () => void;
  onSaveDraft?: (data: CourseSelectionValues) => void;
  courses?: any[]; // Passed from parent to keep component pure
}

export interface CourseSelectionFormRef {
  reset: () => void;
}

export const CourseSelectionForm = React.forwardRef<
  CourseSelectionFormRef,
  CourseSelectionFormProps
>(
  (
    { initialFormData, isLoading, onSubmit, onBack, onSaveDraft, courses },
    ref,
  ) => {
    const form = useForm<CourseSelectionValues>({
      resolver: zodResolver(courseSelectionSchema),
      defaultValues: { ...defaultCourseSelectionState, ...initialFormData },
      mode: "onChange",
    });

    useImperativeHandle(ref, () => ({
      reset: () => form.reset(),
    }));

    const { watch } = form;

    const debouncedSaveDraft = useDebounceCallback(
      (data: CourseSelectionValues) => {
        onSaveDraft?.(data);
      },
      1500,
    );

    useEffect(() => {
      if (!onSaveDraft) return;
      const subscription = watch((value) => {
        debouncedSaveDraft(value as CourseSelectionValues);
      });
      return () => subscription.unsubscribe();
    }, [watch, debouncedSaveDraft, onSaveDraft]);

    const handleSubmit = (data: CourseSelectionValues) => {
      onSubmit(data);
    };

    const isSaving = isLoading || form.formState.isSubmitting;

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 flex flex-col min-h-[300px]"
        >
          <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Course Selection
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Select the course cohort you are applying to join.
            </p>
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Select a Course <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="" disabled>
                        Select your course...
                      </option>
                      {courses?.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name} -{" "}
                          {course.tuitionFee
                            ? `$${course.tuitionFee.toLocaleString()}`
                            : "Free"}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between mt-auto pt-6 border-t font-semibold">
            {onBack ? (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSaving}
                className="px-6 rounded-full border-gray-300 shadow-sm"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="px-8 rounded-full shadow-md bg-stone-900 hover:bg-stone-800 text-primary-foreground disabled:opacity-50 text-white"
            >
              {isSaving ? "Saving..." : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
    );
  },
);

CourseSelectionForm.displayName = "CourseSelectionForm";
