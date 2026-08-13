"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import {
  countWords,
  HIRE_PERIODS,
  JOB_DURATIONS,
  TALENT_LIMITS,
  TALENT_SPECIALTIES,
} from "~/lib/talent.helpers";

/**
 * Mirrors the server rules in `lib/talent.helpers.ts` so mistakes surface
 * inline instead of as a toast after a round-trip. The server re-checks
 * everything — this copy is for feedback, not for safety.
 */
const formSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(TALENT_LIMITS.companyNameMin, "Enter your company name")
    .max(
      TALENT_LIMITS.companyNameMax,
      `Must be ${TALENT_LIMITS.companyNameMax} characters or fewer`,
    ),
  companyEmail: z
    .string()
    .trim()
    .min(1, "Enter a company email")
    .max(TALENT_LIMITS.emailMax, "That email is too long")
    .regex(/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/, "Enter a valid email address"),
  contactPhone: z
    .string()
    .trim()
    .min(1, "Enter a phone number")
    .regex(/^[\d\s+()-]+$/, "Only digits, spaces, +, -, and () are allowed")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return (
        digits.length >= TALENT_LIMITS.phoneMin &&
        digits.length <= TALENT_LIMITS.phoneMax
      );
    }, "Enter a valid phone number"),
  specialties: z
    .array(z.string())
    .min(TALENT_LIMITS.specialtiesMin, "Select at least one specialty")
    .max(
      TALENT_LIMITS.specialtiesMax,
      `Select ${TALENT_LIMITS.specialtiesMax} or fewer`,
    ),
  description: z
    .string()
    .trim()
    .min(
      TALENT_LIMITS.descriptionMin,
      `Give us at least ${TALENT_LIMITS.descriptionMin} characters`,
    )
    .max(
      TALENT_LIMITS.descriptionMaxChars,
      `Must be ${TALENT_LIMITS.descriptionMaxChars} characters or fewer`,
    )
    .refine(
      (value) => countWords(value) <= TALENT_LIMITS.descriptionMaxWords,
      `Must be ${TALENT_LIMITS.descriptionMaxWords} words or fewer`,
    ),
  hirePeriod: z.enum(["short_term", "long_term"], {
    message: "Choose a hire period",
  }),
  jobDuration: z.enum(["full_time", "part_time", "one_off"], {
    message: "Choose a job duration",
  }),
  /** Honeypot — see the mutation. Real users never see or fill this. */
  contactPreference: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const fieldLabel = "block text-sm font-medium text-gray-700";
const fieldInput =
  "mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const errorText = "mt-1 text-xs text-red-600";

export default function HireTalentPage() {
  const submitRequest = useMutation(api.talentRequests.submit);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyEmail: "",
      contactPhone: "",
      specialties: [],
      description: "",
      hirePeriod: undefined,
      jobDuration: undefined,
      contactPreference: "",
    },
  });

  const description = watch("description") ?? "";
  const wordCount = countWords(description);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await submitRequest(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      reset();
      setIsSubmitted(true);
    } catch {
      toast.error("Could not send your request. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-20">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Request received
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            Thank you. Our placement team will review what you need and get back
            to you by email, usually within two working days.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/courses">Browse our programs</Link>
            </Button>
            <Button type="button" onClick={() => setIsSubmitted(false)}>
              Send another request
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Hire from our kitchen
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Tell us the talent you need and our placement team will match you with
          graduates trained for the role. No account required.
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="companyName" className={fieldLabel}>
            Company name *
          </label>
          <input
            id="companyName"
            type="text"
            autoComplete="organization"
            placeholder="e.g., The Lagos Grill House"
            className={fieldInput}
            aria-invalid={!!errors.companyName}
            aria-describedby={
              errors.companyName ? "companyName-error" : undefined
            }
            {...register("companyName")}
          />
          {errors.companyName && (
            <p id="companyName-error" className={errorText}>
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="companyEmail" className={fieldLabel}>
              Company email *
            </label>
            <input
              id="companyEmail"
              type="email"
              autoComplete="email"
              placeholder="hiring@company.com"
              className={fieldInput}
              aria-invalid={!!errors.companyEmail}
              aria-describedby={
                errors.companyEmail ? "companyEmail-error" : undefined
              }
              {...register("companyEmail")}
            />
            {errors.companyEmail && (
              <p id="companyEmail-error" className={errorText}>
                {errors.companyEmail.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contactPhone" className={fieldLabel}>
              Contact phone number *
            </label>
            <input
              id="contactPhone"
              type="tel"
              autoComplete="tel"
              placeholder="+234 800 000 0000"
              className={fieldInput}
              aria-invalid={!!errors.contactPhone}
              aria-describedby={
                errors.contactPhone ? "contactPhone-error" : undefined
              }
              {...register("contactPhone")}
            />
            {errors.contactPhone && (
              <p id="contactPhone-error" className={errorText}>
                {errors.contactPhone.message}
              </p>
            )}
          </div>
        </div>

        <Controller
          control={control}
          name="specialties"
          render={({ field }) => (
            <fieldset>
              <legend className={fieldLabel}>What talent do you need? *</legend>
              <p className="mt-0.5 text-xs text-gray-500">
                Pick every specialty that applies.
              </p>
              <div
                className="mt-2 grid gap-2 sm:grid-cols-2"
                aria-describedby={
                  errors.specialties ? "specialties-error" : undefined
                }
              >
                {TALENT_SPECIALTIES.map((specialty) => {
                  const checked = field.value.includes(specialty.key);
                  return (
                    <label
                      key={specialty.key}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={checked}
                        onChange={() =>
                          field.onChange(
                            checked
                              ? field.value.filter((k) => k !== specialty.key)
                              : [...field.value, specialty.key],
                          )
                        }
                      />
                      {specialty.label}
                    </label>
                  );
                })}
              </div>
              {errors.specialties && (
                <p id="specialties-error" className={errorText}>
                  {errors.specialties.message}
                </p>
              )}
            </fieldset>
          )}
        />

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="description" className={fieldLabel}>
              Describe the talent you need *
            </label>
            <span
              className={
                wordCount > TALENT_LIMITS.descriptionMaxWords
                  ? "text-xs font-medium text-red-600"
                  : "text-xs text-gray-400"
              }
            >
              {wordCount}/{TALENT_LIMITS.descriptionMaxWords} words
            </span>
          </div>
          <textarea
            id="description"
            rows={6}
            placeholder="How many people, what experience level, where they will work, and when you need them to start."
            className={fieldInput}
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
            {...register("description")}
          />
          {errors.description && (
            <p id="description-error" className={errorText}>
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hirePeriod" className={fieldLabel}>
              Estimated hire period *
            </label>
            <select
              id="hirePeriod"
              className={fieldInput}
              defaultValue=""
              aria-invalid={!!errors.hirePeriod}
              aria-describedby={
                errors.hirePeriod ? "hirePeriod-error" : undefined
              }
              {...register("hirePeriod")}
            >
              <option value="" disabled>
                Select a period
              </option>
              {HIRE_PERIODS.map((period) => (
                <option key={period.key} value={period.key}>
                  {period.label}
                </option>
              ))}
            </select>
            {errors.hirePeriod && (
              <p id="hirePeriod-error" className={errorText}>
                {errors.hirePeriod.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="jobDuration" className={fieldLabel}>
              Job duration *
            </label>
            <select
              id="jobDuration"
              className={fieldInput}
              defaultValue=""
              aria-invalid={!!errors.jobDuration}
              aria-describedby={
                errors.jobDuration ? "jobDuration-error" : undefined
              }
              {...register("jobDuration")}
            >
              <option value="" disabled>
                Select a duration
              </option>
              {JOB_DURATIONS.map((duration) => (
                <option key={duration.key} value={duration.key}>
                  {duration.label}
                </option>
              ))}
            </select>
            {errors.jobDuration && (
              <p id="jobDuration-error" className={errorText}>
                {errors.jobDuration.message}
              </p>
            )}
          </div>
        </div>

        {/* Honeypot: hidden from users, irresistible to bots. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="contactPreference">
            Preferred contact method (leave blank)
          </label>
          <input
            id="contactPreference"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("contactPreference")}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            We use your details only to respond to this request.
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Sending..." : "Send request"}
          </Button>
        </div>
      </form>
    </main>
  );
}
