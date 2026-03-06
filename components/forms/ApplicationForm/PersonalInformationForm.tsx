"use client";

import React, { useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { differenceInYears } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useDebounceCallback } from "~/hooks/use-debounce-callback";
import { GenderSelectField } from "../../fields/GenderSelectField";
import { PhoneNumberInputField } from "../../fields/PhoneNumberInputField";
import { DateOfBirthInputField } from "../../fields/DateOfBirthInputField";
import { AddressInputField } from "../../fields/AddressInputField";

export const personalInformationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.string().min(1, "Please select your gender"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((d) => {
      const birthDate = new Date(d);
      if (isNaN(birthDate.getTime())) return false;
      return differenceInYears(new Date(), birthDate) >= 16;
    }, "You must be at least 16 years old"),
  phoneNumber: z.string().min(7, "Please enter a valid phone number"),
  address: z.string().min(10, "Address must be at least 10 characters"),
});

export type PersonalInformationValues = z.infer<
  typeof personalInformationSchema
>;

export const defaultPersonalInformationState: PersonalInformationValues = {
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  phoneNumber: "",
  address: "",
};

export interface PersonalInformationFormProps {
  initialFormData?: Partial<PersonalInformationValues>;
  isLoading?: boolean;
  onSubmit: (data: PersonalInformationValues) => void;
  onBack?: () => void;
  onSaveDraft?: (data: PersonalInformationValues) => void;
}

export interface PersonalInformationFormRef {
  reset: () => void;
}

export const PersonalInformationForm = React.forwardRef<
  PersonalInformationFormRef,
  PersonalInformationFormProps
>(({ initialFormData, isLoading, onSubmit, onBack, onSaveDraft }, ref) => {
  const form = useForm<PersonalInformationValues>({
    resolver: zodResolver(personalInformationSchema),
    defaultValues: { ...defaultPersonalInformationState, ...initialFormData },
    mode: "onChange",
  });

  useImperativeHandle(ref, () => ({
    reset: () => form.reset(),
  }));

  const { watch } = form;

  const debouncedSaveDraft = useDebounceCallback(
    (data: PersonalInformationValues) => {
      onSaveDraft?.(data);
    },
    1500,
  );

  useEffect(() => {
    if (!onSaveDraft) return;
    const subscription = watch((value) => {
      debouncedSaveDraft(value as PersonalInformationValues);
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedSaveDraft, onSaveDraft]);

  const handleSubmit = (data: PersonalInformationValues) => {
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
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateOfBirthInputField control={form.control} name="dateOfBirth" />
            <GenderSelectField control={form.control} name="gender" />
          </div>
          <PhoneNumberInputField control={form.control} name="phoneNumber" />
          <AddressInputField control={form.control} name="address" />
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

PersonalInformationForm.displayName = "PersonalInformationForm";
