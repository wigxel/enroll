"use client";

import { useState } from "react";
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
import { useEffect } from "react";

// Stepper Components
const steps = [
    { id: 1, name: "Personal Information" },
    { id: 2, name: "Educational Background" },
    { id: 3, name: "Course Selection" },
    { id: 4, name: "Review & Submit" },
];

// Define schemas based on the requirements
const step1Schema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    dateOfBirth: z.string().refine((d) => {
        const birthDate = new Date(d);
        if (isNaN(birthDate.getTime())) return false; // invalid date
        return differenceInYears(new Date(), birthDate) >= 16;
    }, "You must be at least 16 years old"),
    phoneNumber: z.string().min(7, "Please enter a valid phone number"),
    address: z.string().min(10, "Address must be at least 10 characters"),
});

const step2Schema = z.object({
    educationalBackground: z
        .string()
        .min(20, "Please provide more details (min 20 characters)"),
});

const step3Schema = z.object({
    courseId: z.string().min(1, "Please select a course to enroll in"),
});

const applicationSchema = z.object({
    ...step1Schema.shape,
    ...step2Schema.shape,
    ...step3Schema.shape,
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;
const appResolver = zodResolver(applicationSchema);

export default function ApplicationForm() {
    const [currentStep, setCurrentStep] = useState(1);

    const form = useForm<ApplicationFormValues>({
        resolver: appResolver,
        defaultValues: {
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            phoneNumber: "",
            address: "",
            educationalBackground: "",
            courseId: "",
        },
        mode: "onChange",
    });

    const {
        watch,
        trigger,
        formState: { isSubmitting },
    } = form;

    // Simulate auto-save to Convex mutation
    const saveDraft = useDebounceCallback((data: ApplicationFormValues) => {
        // TODO: Replace with Convex mutation `applications.saveDraft(data)`
        console.log("Debounced Auto-save Convex draft:", data);
    }, 1500);

    // Watch all form fields for changes
    useEffect(() => {
        const subscription = watch((value) => {
            // We cast the watch value to our form types
            saveDraft(value as ApplicationFormValues);
        });
        return () => subscription.unsubscribe();
    }, [watch, saveDraft]);

    const nextStep = async () => {
        let fieldsToValidate: (keyof ApplicationFormValues)[] = [];

        if (currentStep === 1) {
            fieldsToValidate = [
                "firstName",
                "lastName",
                "dateOfBirth",
                "phoneNumber",
                "address",
            ];
        } else if (currentStep === 2) {
            fieldsToValidate = ["educationalBackground"];
        } else if (currentStep === 3) {
            fieldsToValidate = ["courseId"];
        }

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const onSubmit = async (data: ApplicationFormValues) => {
        console.log("Submitting final application to Convex:", data);
        // 1. Submit to Convex mutations
        // 2. Redirect to Mock payment page /application/pay
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Stepper Header */}
            <div className="w-full">
                <div className="flex justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-gray-200 before:z-0">
                    {steps.map((step, i) => (
                        <div
                            key={step.id}
                            className={`relative z-10 flex flex-col items-center gap-2 ${currentStep > step.id ? "text-primary" : "text-gray-400"
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep >= step.id
                                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                    : "bg-gray-100 text-gray-500"
                                    }`}
                            >
                                {step.id}
                            </div>
                            <span
                                className={`text-xs font-medium hidden sm:block ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                                    }`}
                            >
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl border shadow-sm">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6 flex flex-col min-h-[300px]"
                    >
                        {/* Form Fields Map */}
                        {currentStep === 1 && (
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
                                                <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
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
                                                <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Residential Address <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <textarea
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="Your full home street address"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                                    Educational Background
                                </h2>
                                <FormField
                                    control={form.control}
                                    name="educationalBackground"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Education Details <span className="text-red-500">*</span></FormLabel>
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
                        )}

                        {currentStep === 3 && (
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
                                            <FormLabel>Select a Course <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    <option value="" disabled>Select your course...</option>
                                                    <option value="course_1">Frontend Web Development Bootcamp - $499</option>
                                                    <option value="course_2">Backend Systems Engineering - $599</option>
                                                    <option value="course_3">Fullstack Launchpad - $899</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                                    Review & Submit
                                </h2>

                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg text-sm">
                                    <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                        <span className="font-medium text-gray-500">Name:</span>
                                        <span className="col-span-2 text-gray-900">{form.getValues("firstName")} {form.getValues("lastName")}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                        <span className="font-medium text-gray-500">Date of Birth:</span>
                                        <span className="col-span-2 text-gray-900">{form.getValues("dateOfBirth")}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                        <span className="font-medium text-gray-500">Phone:</span>
                                        <span className="col-span-2 text-gray-900">{form.getValues("phoneNumber")}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                        <span className="font-medium text-gray-500">Address:</span>
                                        <span className="col-span-2 text-gray-900">{form.getValues("address")}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                        <span className="font-medium text-gray-500">Education Details:</span>
                                        <span className="col-span-2 text-gray-900 line-clamp-2">{form.getValues("educationalBackground")}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                        <span className="font-medium text-gray-500">Selected Course:</span>
                                        <span className="col-span-2 text-gray-900 font-medium">#{form.getValues("courseId")}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <Input
                                        type="checkbox"
                                        id="confirm"
                                        className="mt-1 h-5 w-5 shrink-0 rounded-sm border-gray-300 text-primary focus:ring-primary accent-primary"
                                        required
                                    />
                                    <div className="flex flex-col">
                                        <label htmlFor="confirm" className="text-sm font-medium text-gray-700 leading-tight">
                                            I confirm that the information provided is accurate
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            By submitting this form, you acknowledge that any false information may lead to the rejection of your application.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Actions */}
                        <div className="flex justify-between mt-auto pt-6 border-t font-semibold">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1 || isSubmitting}
                                className="px-6 rounded-full border-gray-300 shadow-sm"
                            >
                                Back
                            </Button>

                            {currentStep < steps.length ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 rounded-full shadow-md bg-stone-900 hover:bg-stone-800 text-primary-foreground"
                                >
                                    Continue
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 rounded-full shadow-md bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
