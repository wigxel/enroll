"use client";

import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

interface QuizPolicySectionProps {
  courseId: Id<"courses">;
}

const quizPolicySchema = z.object({
  enabled: z.boolean(),
  passScore: z.number().min(0).max(100),
  allowRetake: z.boolean(),
  maxAttempts: z.number().min(1),
});

type QuizPolicyFormData = z.infer<typeof quizPolicySchema>;

const defaultQuizPolicy: QuizPolicyFormData = {
  enabled: false,
  passScore: 80,
  allowRetake: false,
  maxAttempts: 1,
};

export function QuizPolicySection({ courseId }: QuizPolicySectionProps) {
  const courseResult = useQuery(api.courses.getById, { courseId });
  const updateCourse = useMutation(api.courses.update);

  const course = courseResult?.success ? courseResult.data : null;
  const quizPolicy = course?.quizPolicy as QuizPolicyFormData | undefined;

  const form = useForm<QuizPolicyFormData>({
    resolver: zodResolver(quizPolicySchema),
    defaultValues: quizPolicy ?? defaultQuizPolicy,
  });

  const onSubmit = async (data: QuizPolicyFormData) => {
    try {
      const res = await updateCourse({
        courseId,
        quizPolicy: data,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Quiz policy updated");
      }
    } catch (err) {
      toast.error("Failed to update quiz policy");
    }
  };

  const allowRetake = form.watch("allowRetake");

  if (courseResult === undefined) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading quiz policy...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-gray-500" />
        <h2 className="text-xl font-semibold text-gray-900">
          Orientation Quiz Policy
        </h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Enable Quiz Toggle */}
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <FormLabel>Enable Quiz</FormLabel>
                    <FormDescription>
                      Enable the orientation quiz for this course
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.getValues("enabled") && (
              <>
                {/* Pass Score */}
                <FormField
                  control={form.control}
                  name="passScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pass Score (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum score required to pass (percentage)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Allow Retake */}
                <FormField
                  control={form.control}
                  name="allowRetake"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <FormLabel>Allow Retake</FormLabel>
                        <FormDescription>
                          Allow students to retake the quiz after failing
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Max Attempts */}
                {allowRetake && (
                  <FormField
                    control={form.control}
                    name="maxAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Attempts</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of attempts allowed (1 or more)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="gap-2"
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Policy
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </div>
    </section>
  );
}
