"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { toast } from "sonner";
import { FileUpload } from "~/components/ui/file-upload";
import { useState } from "react";

const courseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.string().min(1, "Duration is required"),
  certification: z.string().min(1, "Certification is required"),
  tuitionFee: z.coerce.number().min(0, "Tuition fee must be a positive number"),
  coverPhoto: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface EditCourseFormProps {
  courseId: Id<"courses">;
}

const defaultState: CourseFormValues = {
  name: "",
  slug: "",
  description: "",
  duration: "",
  certification: "",
  tuitionFee: 0,
  coverPhoto: undefined,
};

export function EditCourseForm({ courseId }: EditCourseFormProps) {
  const courseResult = useQuery(api.courses.getById, { courseId });
  const updateCourse = useMutation(api.courses.update);
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(undefined);

  const course = courseResult?.success ? courseResult.data : null;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: course
      ? {
          name: course.name,
          slug: course.slug,
          description: course.description,
          duration: course.duration,
          certification: course.certification,
          tuitionFee: course.tuitionFee,
          coverPhoto: course.coverPhoto,
        }
      : defaultState,
  });

  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: CourseFormValues) => {
    try {
      const res = await updateCourse({
        courseId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        duration: data.duration,
        certification: data.certification,
        tuitionFee: data.tuitionFee,
        coverPhoto: data.coverPhoto,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Course updated");
      }
    } catch (error) {
      toast.error("Failed to update course");
    }
  };

  if (!course) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 12 weeks" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tuitionFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tuition Fee ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverPhoto"
          render={() => (
            <FormItem>
              <FormLabel>Cover Photo</FormLabel>
              <FormControl>
                <FileUpload
                  onUploadComplete={(storageId) => {
                    setCoverPhoto(storageId);
                    form.setValue("coverPhoto", storageId);
                  }}
                  onRemove={() => {
                    setCoverPhoto(undefined);
                    form.setValue("coverPhoto", undefined);
                  }}
                  previewUrl={coverPhoto || course.coverPhoto}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
