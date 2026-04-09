"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Id } from "~/convex/_generated/dataModel";

export const createEnrollmentSchema = z.object({
  cohortId: z.string().min(1, "Please select a cohort"),
  courseId: z.string().min(1, "Please select a course"),
  isPaid: z.boolean(),
});

export type CreateEnrollmentValues = z.infer<typeof createEnrollmentSchema>;

export const defaultCreateEnrollmentState: CreateEnrollmentValues = {
  cohortId: "",
  courseId: "",
  isPaid: false,
};

interface CreateEnrollmentFormProps {
  cohorts: { _id: Id<"cohorts">; name: string }[];
  courses: { _id: Id<"courses">; name: string }[];
  onSubmit: (data: CreateEnrollmentValues) => void;
  onCancel: () => void;
}

export function CreateEnrollmentForm({
  cohorts,
  courses,
  onSubmit,
  onCancel,
}: CreateEnrollmentFormProps) {
  const form = useForm<CreateEnrollmentValues>({
    resolver: zodResolver(createEnrollmentSchema),
    defaultValues: defaultCreateEnrollmentState,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="cohortId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Cohort</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.formState.isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a cohort..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cohorts.map((cohort) => (
                      <SelectItem key={cohort._id} value={cohort._id}>
                        {cohort.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Course</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.formState.isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPaid"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </FormControl>
                <FormLabel className="font-normal text-gray-700">
                  Already paid (Graduate)
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex-1"
          >
            {form.formState.isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
