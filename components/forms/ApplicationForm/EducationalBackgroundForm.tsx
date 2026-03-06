"use client";

import React, { useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

export const educationalBackgroundSchema = z.object({
  educationalBackground: z
    .string()
    .min(20, "Please provide more details (min 20 characters)"),
});

export type EducationalBackgroundValues = z.infer<
  typeof educationalBackgroundSchema
>;

export const defaultEducationalBackgroundState: EducationalBackgroundValues = {
  educationalBackground: "",
};

export interface EducationalBackgroundFormProps {
  initialFormData?: Partial<EducationalBackgroundValues>;
  isLoading?: boolean;
  onSubmit: (data: EducationalBackgroundValues) => void;
  onBack?: () => void;
  onSaveDraft?: (data: EducationalBackgroundValues) => void;
}

export interface EducationalBackgroundFormRef {
  reset: () => void;
}

export const EducationalBackgroundForm = React.forwardRef<
  EducationalBackgroundFormRef,
  EducationalBackgroundFormProps
>(({ initialFormData, isLoading, onSubmit, onBack, onSaveDraft }, ref) => {
  const form = useForm<EducationalBackgroundValues>({
    resolver: zodResolver(educationalBackgroundSchema),
    defaultValues: { ...defaultEducationalBackgroundState, ...initialFormData },
    mode: "onChange",
  });

  useImperativeHandle(ref, () => ({
    reset: () => form.reset(),
  }));

  const { watch } = form;

  const debouncedSaveDraft = useDebounceCallback(
    (data: EducationalBackgroundValues) => {
      onSaveDraft?.(data);
    },
    1500,
  );

  useEffect(() => {
    if (!onSaveDraft) return;
    const subscription = watch((value) => {
      debouncedSaveDraft(value as EducationalBackgroundValues);
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedSaveDraft, onSaveDraft]);

  const handleSubmit = (data: EducationalBackgroundValues) => {
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
            Educational Background
          </h2>
          <FormField
            control={form.control}
            name="educationalBackground"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Education Details <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Please describe your highest level of education. E.g. BSc in Computer Science from University of Example (2020-2024)."
                    {...field}
                  />
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
});

EducationalBackgroundForm.displayName = "EducationalBackgroundForm";
