"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Form } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

// To submit the final form, they just need to confirm.
export const reviewSubmissionSchema = z.object({
  confirm: z.literal(true, {
    message: "You must confirm the information is accurate",
  }),
});

export type ReviewSubmissionValues = z.infer<typeof reviewSubmissionSchema>;

export const defaultReviewSubmissionState: ReviewSubmissionValues = {
  confirm: true, // We default to true in code or make them explicitly tick it. Wait, if it's a checkbox we should default to false.
};

export interface ReviewSubmissionProps {
  formData: any;
  courses?: any[];
  isLoading?: boolean;
  onSubmit: (data: ReviewSubmissionValues) => void;
  onBack?: () => void;
}

export interface ReviewSubmissionRef {
  reset: () => void;
}

export const ReviewSubmission = React.forwardRef<
  ReviewSubmissionRef,
  ReviewSubmissionProps
>(({ formData, courses, isLoading, onSubmit, onBack }, ref) => {
  const form = useForm<ReviewSubmissionValues>({
    resolver: zodResolver(reviewSubmissionSchema),
    defaultValues: { confirm: false } as any,
  });

  useImperativeHandle(ref, () => ({
    reset: () => form.reset(),
  }));

  const handleSubmit = (data: ReviewSubmissionValues) => {
    onSubmit(data);
  };

  const isConfirmed = form.watch("confirm");
  const isSaving = isLoading || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 flex flex-col min-h-[300px]"
      >
        <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Review & Submit
          </h2>

          <ul className="space-y-4 py-4 divide-y divide-gray-200 rounded-lg text-sm">
            <li className="grid grid-cols-3 gap-2 pb-2">
              <span className="font-medium text-gray-500">Name:</span>
              <span className="col-span-2 text-gray-900">
                {formData.firstName} {formData.lastName}
              </span>
            </li>
            <li className="grid grid-cols-3 gap-2 pb-2">
              <span className="font-medium text-gray-500">Email:</span>
              <span className="col-span-2 text-gray-900">{formData.email}</span>
            </li>
            <li className="grid grid-cols-3 gap-2 pb-2">
              <span className="font-medium text-gray-500">Gender:</span>
              <span className="col-span-2 text-gray-900">
                {formData.gender}
              </span>
            </li>
            <li className="grid grid-cols-3 gap-2 pb-2">
              <span className="font-medium text-gray-500">Date of Birth:</span>
              <span className="col-span-2 text-gray-900">
                {formData.dateOfBirth}
              </span>
            </li>
            <li className="grid grid-cols-3 gap-2 pb-2">
              <span className="font-medium text-gray-500">Phone:</span>
              <span className="col-span-2 text-gray-900">
                {formData.phoneNumber}
              </span>
            </li>
            <li className="grid grid-cols-3 gap-2 pb-2">
              <span className="font-medium text-gray-500">Address:</span>
              <span className="col-span-2 text-gray-900">
                {formData.address}
              </span>
            </li>
            <li className="grid grid-cols-3 gap-2 pb-2">
              <span className="font-medium text-gray-500">
                Education Details:
              </span>
              <span className="col-span-2 text-gray-900 line-clamp-2">
                {formData.educationalBackground}
              </span>
            </li>
            <li className="grid grid-cols-3 gap-2 pb-2">
              <span className="font-medium text-gray-500">
                Selected Course:
              </span>
              <span className="col-span-2 text-gray-900 font-medium line-clamp-1">
                {courses?.find((c) => c._id === formData.courseId)?.name ||
                  "..."}
              </span>
            </li>
          </ul>

          <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <Checkbox
              id="confirm"
              className="mt-1 h-5 w-5 shrink-0 rounded-sm border-gray-300 text-primary focus:ring-primary accent-primary"
              checked={form.watch("confirm")}
              onCheckedChange={(value) => {
                // @ts-expect-error Not a problem
                form.setValue("confirm", value);
              }}
            />
            <div className="flex flex-col">
              <label
                htmlFor="confirm"
                className="text-sm font-medium text-gray-700 leading-tight"
              >
                I confirm that the information provided is accurate
              </label>
              <p className="text-xs text-gray-500 mt-1">
                By submitting this form, you acknowledge that any false
                information may lead to the rejection of your application.
              </p>
              {form.formState.errors.confirm && (
                <span className="text-sm text-red-500 mt-1">
                  {form.formState.errors.confirm.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-auto pt-6 border-t font-semibold">
          {onBack ? (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSaving}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button type="submit" disabled={isSaving || !isConfirmed}>
            {isSaving ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
});

ReviewSubmission.displayName = "ReviewSubmission";
