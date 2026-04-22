"use client";

import { useMutation, useQuery } from "convex/react";
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { safeArray } from "@/lib/data.helpers";
import { isDevelopment } from "@/lib/utils";
import { useDebounceCallback } from "~/hooks/use-debounce-callback";
import {
  EducationalBackgroundForm,
  type EducationalBackgroundValues,
} from "./EducationalBackgroundForm";
import {
  PersonalInformationForm,
  type PersonalInformationValues,
} from "./PersonalInformationForm";
import { ReviewSubmission } from "./ReviewSubmission";

// Stepper Components
const steps = [
  { id: 1, name: "Personal Information" },
  { id: 2, name: "Educational Background" },
  { id: 3, name: "Review & Submit" },
];

interface ApplicationFormProps {
  defaultCourseId?: Id<"courses">;
}

export default function ApplicationForm({
  defaultCourseId,
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const coursesResult = useQuery(api.courses.listActive);
  const courses = safeArray((coursesResult as any)?.data);
  const createApplication = useMutation(api.applications.create);
  const appStatusResult = useQuery(api.settings.getAppStatus);
  const hasApplicationFee = appStatusResult?.success
    ? (appStatusResult.data?.applicationFeeAmount ?? 0) > 0
    : false;

  const [formData, setFormData] = useState<{
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
    educationalBackground: string;
    courseId: string;
  }>(() => {
    const isDev = isDevelopment();
    return {
      firstName: isDev ? "John" : "",
      middleName: isDev ? "Michael" : "",
      lastName: isDev ? "Doe" : "",
      email: isDev ? "john.doe@example.com" : "",
      gender: isDev ? "Male" : "",
      dateOfBirth: isDev ? "1998-05-15" : "",
      phoneNumber: isDev ? "+2348000000000" : "",
      address: isDev ? "123 Development Street, Tech City" : "",
      educationalBackground: isDev
        ? "BSc in Computer Science from University of Example (2020-2024)."
        : "",
      courseId: defaultCourseId || "",
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulate auto-save to Convex mutation
  const saveDraft = useDebounceCallback((data: any) => {
    // TODO: Replace with Convex mutation `applications.saveDraft(data)`
    console.log("Debounced Auto-save Convex draft:", data);
  }, 1500);

  const handleSaveDraft = (stepData: any) => {
    const updated = { ...formData, ...stepData };
    setFormData(updated);
    saveDraft(updated);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onStep1Submit = (data: PersonalInformationValues) => {
    setFormData((prev) => ({ ...prev, ...data }));
    nextStep();
  };

  const onStep2Submit = (data: EducationalBackgroundValues) => {
    setFormData((prev) => ({ ...prev, ...data }));
    nextStep();
  };

  const onFinalSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.dateOfBirth ||
        !formData.gender ||
        !formData.address ||
        !formData.phoneNumber ||
        !formData.educationalBackground ||
        !formData.courseId
      ) {
        throw new Error(
          "Missing required fields. Please go back and ensure all fields are filled.",
        );
      }

      const res = await createApplication({
        data: {
          firstName: formData.firstName,
          middleName: formData.middleName || undefined,
          lastName: formData.lastName,
          email: formData.email,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          educationalBackground: formData.educationalBackground,
          courseId: formData.courseId as Id<"courses">,
        },
      });

      if (!res.success) {
        throw new Error(res.error);
      }
      const applicationId = res.data;

      toast.success("Application submitted successfully!");
      // Redirect to payment or under-review based on fee configuration
      if (hasApplicationFee) {
        router.push(`/application/pay?reference=${applicationId}`);
      } else {
        router.push("/application/under-review");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Stepper Header */}
      <div className="w-full pt-6 px-4 pb-2 bg-background shadow-sm rounded-2xl">
        <div className="flex -mx-4 px-4 pointer-events-none select-none justify-between relative before:absolute before:inset-0 before:top-4 before:-translate-y-1/2 before:h-0.5 before:bg-gray-200 before:z-0">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`relative z-10 flex flex-col items-center gap-2 ${currentStep > step.id ? "text-primary" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 font-mono rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {String(step.id).padStart(2, "0")}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background shadow-lg px-8 py-8 rounded-2xl">
        {currentStep === 1 && (
          <PersonalInformationForm
            initialFormData={formData}
            onSubmit={onStep1Submit}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {currentStep === 2 && (
          <EducationalBackgroundForm
            initialFormData={formData}
            onSubmit={onStep2Submit}
            onBack={prevStep}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {currentStep === 3 && (
          <ReviewSubmission
            formData={formData}
            courses={courses}
            onSubmit={onFinalSubmit}
            onBack={prevStep}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
