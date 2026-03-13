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
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
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
  email: z.string().email("Please enter a valid email address"),
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

const phoneOnlySchema = personalInformationSchema.pick({ phoneNumber: true });

export type PersonalInformationValues = z.infer<
  typeof personalInformationSchema
>;

export const defaultPersonalInformationState: PersonalInformationValues = {
  firstName: "",
  lastName: "",
  email: "",
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
  const convex = useConvex();
  const [isInitialValidated, setIsInitialValidated] = React.useState(false);
  const [isValidatingInitial, setIsValidatingInitial] = React.useState(false);
  const [existingApp, setExistingApp] = React.useState<{
    id: string;
    status: string;
    paymentStatus: string;
  } | null>(null);

  const initialSchema = personalInformationSchema.pick({
    email: true,
    phoneNumber: true,
  });

  const form = useForm<PersonalInformationValues>({
    resolver: zodResolver(
      isInitialValidated ? personalInformationSchema : initialSchema,
    ),
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

  const handleSubmit = async (data: PersonalInformationValues) => {
    // If not yet validated, we only validate the email address and phone number
    if (!isInitialValidated) {
      setIsValidatingInitial(true);
      try {
        const result = await convex.query(api.applications.checkExisting, {
          email: data.email,
          phoneNumber: data.phoneNumber,
        });

        if (result) {
          // Found an existing application
          setExistingApp(result);
        } else {
          // No application found, proceed to full form
          setIsInitialValidated(true);
        }
      } catch (err) {
        console.error("Failed to check existing application", err);
      } finally {
        setIsValidatingInitial(false);
      }
      return;
    }

    // Full form submission
    onSubmit(data);
  };

  const isSaving =
    isLoading || form.formState.isSubmitting || isValidatingInitial;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 flex flex-col min-h-[300px]"
      >
        <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {isInitialValidated ? "Personal Information" : "Getting Started"}
          </h2>

          {!existingApp && (
            <div
              className={
                isInitialValidated
                  ? "opacity-70 pointer-events-none mb-4"
                  : "space-y-4"
              }
            >
              {!isInitialValidated && (
                <p className="text-gray-500 text-sm mb-6">
                  Please enter your email address and phone number to check if
                  you already have an application in progress.
                </p>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PhoneNumberInputField
                control={form.control}
                name="phoneNumber"
              />
            </div>
          )}

          {existingApp && (
            <div className="rounded-lg border p-6 bg-gray-50 dark:bg-zinc-900/50 space-y-4">
              {existingApp.paymentStatus === "unpaid" ? (
                <>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium">
                    <AlertCircle className="w-5 h-5" />
                    Pending Payment
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We found an existing application with these details, but the
                    application fee has not been paid yet.
                  </p>
                  <Button asChild className="w-full sm:w-auto mt-4">
                    <Link href={`/application/pay?reference=${existingApp.id}`}>
                      Proceed to Payment <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Application Received
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You already have a {existingApp.status.replace("_", " ")}{" "}
                    application with these details. Please check your email or
                    dashboard for updates, and wait for it to be processed.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto mt-4"
                  >
                    <Link href="/student/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              )}
            </div>
          )}

          {isInitialValidated && (
            <>
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
                <DateOfBirthInputField
                  control={form.control}
                  name="dateOfBirth"
                />
                <GenderSelectField control={form.control} name="gender" />
              </div>

              <AddressInputField control={form.control} name="address" />
            </>
          )}
        </div>

        <div className="flex justify-between mt-auto pt-6 border-t font-semibold">
          {onBack || existingApp ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (existingApp) {
                  setExistingApp(null);
                  form.resetField("email");
                  form.resetField("phoneNumber");
                } else {
                  onBack?.();
                }
              }}
              disabled={isSaving}
              className="px-6 rounded-full border-gray-300 shadow-sm"
            >
              {existingApp ? "Start Over" : "Back"}
            </Button>
          ) : (
            <div />
          )}

          {!existingApp && (
            <Button
              type="submit"
              disabled={isSaving}
              className="px-8 flex items-center justify-center rounded-full shadow-md bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isInitialValidated ? "Continue to Education" : "Continue"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
});

PersonalInformationForm.displayName = "PersonalInformationForm";
