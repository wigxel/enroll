"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export type FaqFormValues = z.infer<typeof faqSchema>;

export const defaultFaqFormState: FaqFormValues = {
  question: "",
  answer: "",
};

interface FaqFormProps {
  initialFormData?: Partial<FaqFormValues>;
  isActive?: boolean;
  isLoading?: boolean;
  onSubmit: (data: FaqFormValues) => void;
}

export function FaqForm({
  initialFormData,
  isLoading = false,
  onSubmit,
}: FaqFormProps) {
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: initialFormData?.question ?? "",
      answer: initialFormData?.answer ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      question: initialFormData?.question ?? "",
      answer: initialFormData?.answer ?? "",
    });
  }, [initialFormData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter the question..."
                  rows={2}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter the answer..."
                  rows={4}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogTrigger>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
