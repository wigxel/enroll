"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  useForm,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FileUpload } from "~/components/ui/file-upload";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

const MAX_DESCRIPTION_WORDS = 600;

const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const salaryField = (label: string) =>
  z
    // An empty number input yields "", which a bare coercion would silently turn
    // into 0 — reject it explicitly so the admin sees a real error.
    .string()
    .trim()
    .min(1, `${label} is required`)
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val), "Enter a valid amount")
    .refine((val) => val >= 0, "Cannot be negative");

const jobSchema = z
  .object({
    title: z.string().trim().min(1, "Job title is required"),
    company: z.string().trim().min(1, "Company name is required"),
    salaryMin: salaryField("Minimum salary"),
    salaryMax: salaryField("Maximum salary"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .refine((val) => countWords(val) <= MAX_DESCRIPTION_WORDS, {
        message: `Description must be ${MAX_DESCRIPTION_WORDS} words or fewer`,
      }),
    image: z.string().optional(),
  })
  .refine((data) => data.salaryMin <= data.salaryMax, {
    message: "Minimum cannot exceed maximum",
    path: ["salaryMax"],
  });

type JobFormInput = z.input<typeof jobSchema>;
type JobFormOutput = z.output<typeof jobSchema>;

export interface JobRecord {
  _id: Id<"jobs">;
  title: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  image?: string;
}

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobRecord | null;
  /** Receives the new job's ID so the caller can link it to a course. */
  onCreated?: (jobId: Id<"jobs">) => void;
}

const defaultState: JobFormInput = {
  title: "",
  company: "",
  salaryMin: "",
  salaryMax: "",
  description: "",
  image: undefined,
};

type JobField =
  | "title"
  | "company"
  | "salaryMin"
  | "salaryMax"
  | "description";

const jobFieldOrder: JobField[] = [
  "title",
  "company",
  "salaryMin",
  "salaryMax",
  "description",
];

export function JobFormDialog({
  open,
  onOpenChange,
  job,
  onCreated,
}: JobFormDialogProps) {
  const createJob = useMutation(api.jobs.create);
  const updateJob = useMutation(api.jobs.update);

  const isEditing = !!job;
  const [highlightedField, setHighlightedField] =
    useState<JobField | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimeoutRef = useRef<number | null>(null);

  // The list query resolves images to URLs already; only fall back to a storage
  // lookup when the caller handed us a raw storage ID.
  const isStorageId = !!job?.image && !job.image.startsWith("http");
  const imageResult = useQuery(
    api.storage.getFileUrl,
    isStorageId ? { storageId: job.image as Id<"_storage"> } : "skip",
  );
  const existingImageUrl = isStorageId
    ? imageResult?.success
      ? imageResult.data
      : null
    : (job?.image ?? null);

  const form = useForm<JobFormInput, unknown, JobFormOutput>({
    resolver: zodResolver(jobSchema) as Resolver<
      JobFormInput,
      unknown,
      JobFormOutput
    >,
    defaultValues: defaultState,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setFocus,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const descriptionValue = watch("description") ?? "";
  const titleValue = watch("title") ?? "";
  const companyValue = watch("company") ?? "";
  const salaryMinValue = watch("salaryMin") ?? "";
  const salaryMaxValue = watch("salaryMax") ?? "";
  const wordCount = countWords(descriptionValue);
  const isOverLimit = wordCount > MAX_DESCRIPTION_WORDS;
  const isBlank = (value: string) => value.trim().length === 0;

  useEffect(() => {
    if (!open) return;
    setHighlightedField(null);
    setIsShaking(false);
    reset(
      job
        ? {
            title: job.title,
            company: job.company,
            salaryMin: String(job.salaryMin),
            salaryMax: String(job.salaryMax),
            description: job.description,
            image: job.image,
          }
        : defaultState,
    );
  }, [open, job, reset]);

  useEffect(
    () => () => {
      if (shakeTimeoutRef.current !== null) {
        window.clearTimeout(shakeTimeoutRef.current);
      }
    },
    [],
  );

  const triggerShake = () => {
    if (shakeTimeoutRef.current !== null) {
      window.clearTimeout(shakeTimeoutRef.current);
    }

    setIsShaking(false);
    shakeTimeoutRef.current = window.setTimeout(() => {
      setIsShaking(true);
      shakeTimeoutRef.current = null;
    }, 0);
  };

  const handleInvalid = (validationErrors: FieldErrors<JobFormInput>) => {
    const firstInvalidField = jobFieldOrder.find(
      (field) => validationErrors[field],
    );

    if (!firstInvalidField) return;

    setHighlightedField(firstInvalidField);
    triggerShake();
    setFocus(firstInvalidField);
  };

  const findFirstEmptyField = () => {
    const values = getValues();
    return jobFieldOrder.find(
      (field) => String(values[field] ?? "").trim().length === 0,
    );
  };

  const showFieldError = (field: JobField) => {
    setHighlightedField(field);
    triggerShake();
    setFocus(field);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const firstEmptyField = findFirstEmptyField();

    if (firstEmptyField) {
      event.preventDefault();
      showFieldError(firstEmptyField);
      return;
    }

    void handleSubmit(onSubmit, handleInvalid)(event);
  };

  const titleHasError =
    highlightedField === "title" && isBlank(titleValue);
  const companyHasError =
    highlightedField === "company" && isBlank(companyValue);
  const salaryMinHasError =
    highlightedField === "salaryMin" &&
    (isBlank(salaryMinValue) || !!errors.salaryMin);
  const salaryMaxHasError =
    highlightedField === "salaryMax" &&
    (isBlank(salaryMaxValue) || !!errors.salaryMax);
  const descriptionHasError =
    highlightedField === "description" &&
    (isBlank(descriptionValue) || (!!errors.description && isOverLimit));
  const titleErrorMessage = titleHasError
    ? (errors.title?.message ?? "Job title is required")
    : undefined;
  const companyErrorMessage = companyHasError
    ? (errors.company?.message ?? "Company name is required")
    : undefined;
  const salaryMinErrorMessage = salaryMinHasError
    ? (errors.salaryMin?.message ?? "Minimum salary is required")
    : undefined;
  const salaryMaxErrorMessage = salaryMaxHasError
    ? (errors.salaryMax?.message ?? "Maximum salary is required")
    : undefined;
  const descriptionErrorMessage = descriptionHasError
    ? (errors.description?.message ?? "Description is required")
    : undefined;

  const onSubmit = async (values: JobFormOutput) => {
    try {
      if (isEditing && job) {
        // null clears a removed image; undefined would read as "unchanged".
        const res = await updateJob({
          jobId: job._id,
          ...values,
          image: values.image ?? null,
        });
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("Job updated");
      } else {
        const res = await createJob(values);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("Job created");
        onCreated?.(res.data);
      }

      setHighlightedField(null);
      setIsShaking(false);
      reset(defaultState);
      onOpenChange(false);
    } catch {
      toast.error(
        isEditing ? "Failed to update job" : "Failed to create job",
      );
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setHighlightedField(null);
      setIsShaking(false);
      reset(defaultState);
    }
    onOpenChange(nextOpen);
  };

  const inputClass =
    "mt-1 w-full rounded-md px-3 py-2 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const getInputClass = (field: JobField, hasError: boolean) =>
    `${inputClass} ${hasError ? "border border-dashed border-red-500 focus:border-input" : "border border-input focus:border-input"}${highlightedField === field && isShaking ? " job-field-shake" : ""}`;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Job Opportunity" : "Add Job Opportunity"}
          </SheetTitle>
          <SheetDescription>
            Shown to prospective students as a career outcome for this course.
          </SheetDescription>
        </SheetHeader>

        <form
          noValidate
          onSubmit={handleFormSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            <div>
              <label
                htmlFor="job-title"
                className="block text-sm font-medium text-gray-700"
              >
                Job Title *
              </label>
              <input
                id="job-title"
                type="text"
                placeholder="e.g., Pastry Chef"
                required
                {...register("title")}
                aria-invalid={titleHasError}
                aria-describedby={
                  titleErrorMessage ? "job-title-error" : undefined
                }
                className={getInputClass("title", titleHasError)}
                onAnimationEnd={() => setIsShaking(false)}
              />
              {titleErrorMessage && (
                <p id="job-title-error" className="mt-1 text-xs text-red-600">
                  {titleErrorMessage}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="job-company"
                className="block text-sm font-medium text-gray-700"
              >
                Company *
              </label>
              <input
                id="job-company"
                type="text"
                placeholder="e.g., Jays Bartending"
                required
                {...register("company")}
                aria-invalid={companyHasError}
                aria-describedby={
                  companyErrorMessage ? "job-company-error" : undefined
                }
                className={getInputClass("company", companyHasError)}
                onAnimationEnd={() => setIsShaking(false)}
              />
              {companyErrorMessage && (
                <p id="job-company-error" className="mt-1 text-xs text-red-600">
                  {companyErrorMessage}
                </p>
              )}
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-gray-700">
                Salary Range (per annum) *
              </legend>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      ₦
                    </span>
                    <input
                      id="job-salary-min"
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="Min"
                      required
                      aria-label="Minimum salary per annum"
                      {...register("salaryMin")}
                      aria-invalid={salaryMinHasError}
                      aria-describedby={
                        salaryMinErrorMessage
                          ? "job-salary-min-error"
                          : undefined
                      }
                      className={`${getInputClass("salaryMin", salaryMinHasError)} mt-0 pl-7`}
                      onAnimationEnd={() => setIsShaking(false)}
                    />
                  </div>
                  {salaryMinErrorMessage && (
                    <p
                      id="job-salary-min-error"
                      className="mt-1 text-xs text-red-600"
                    >
                      {salaryMinErrorMessage}
                    </p>
                  )}
                </div>
                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      ₦
                    </span>
                    <input
                      id="job-salary-max"
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="Max"
                      required
                      aria-label="Maximum salary per annum"
                      {...register("salaryMax")}
                      aria-invalid={salaryMaxHasError}
                      aria-describedby={
                        salaryMaxErrorMessage
                          ? "job-salary-max-error"
                          : undefined
                      }
                      className={`${getInputClass("salaryMax", salaryMaxHasError)} mt-0 pl-7`}
                      onAnimationEnd={() => setIsShaking(false)}
                    />
                  </div>
                  {salaryMaxErrorMessage && (
                    <p
                      id="job-salary-max-error"
                      className="mt-1 text-xs text-red-600"
                    >
                      {salaryMaxErrorMessage}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            <div>
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="job-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description *
                </label>
                <span
                  className={`text-xs ${
                    isOverLimit ? "font-medium text-red-600" : "text-gray-400"
                  }`}
                >
                  {wordCount}/{MAX_DESCRIPTION_WORDS} words
                </span>
              </div>
              <textarea
                id="job-description"
                rows={8}
                placeholder="Describe the role, responsibilities, and what makes it a great fit for graduates."
                required
                {...register("description")}
                aria-invalid={descriptionHasError}
                aria-describedby={
                  descriptionErrorMessage
                    ? "job-description-error"
                    : undefined
                }
                className={getInputClass("description", descriptionHasError)}
                onAnimationEnd={() => setIsShaking(false)}
              />
              {descriptionErrorMessage && (
                <p
                  id="job-description-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {descriptionErrorMessage}
                </p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">
                Image
              </span>
              <FileUpload
                className="mt-1"
                onUploadComplete={(storageId) =>
                  setValue("image", storageId, { shouldValidate: true })
                }
                onRemove={() => setValue("image", undefined)}
                previewUrl={existingImageUrl}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <SheetFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverLimit}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Job"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
