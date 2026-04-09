"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, CheckCircle2, Clock, Loader2, Plus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FaqDialog } from "~/components/admin/dialogs/FaqDialog";
import { LinkFaqsSheet } from "~/components/admin/dialogs/LinkFaqsSheet";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as Id<"courses">;

  const courseResult = useQuery(api.courses.getById, { courseId });
  const enrollmentsResult = useQuery(api.enrollments.listByCourseId, {
    courseId,
  });
  const allFaqsResult = useQuery(api.faqs.list);
  const linkedFaqsResult = useQuery(api.faqs.listByIds, {
    faqIds: courseResult?.success ? (courseResult.data?.faqIds ?? []) : [],
  });
  const updateCourse = useMutation(api.courses.update);
  const updateCourseFaqs = useMutation(api.courses.updateFaqs);
  const createFaq = useMutation(api.faqs.create);

  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [showLinkFaqMenu, setShowLinkFaqSheet] = useState(false);

  const course = courseResult?.success ? courseResult.data : null;
  const enrollments = enrollmentsResult?.success ? enrollmentsResult.data : [];
  const allFaqs = allFaqsResult?.success ? allFaqsResult.data : [];
  const linkedFaqs = linkedFaqsResult?.success ? linkedFaqsResult.data : [];

  const isLoading =
    courseResult === undefined ||
    enrollmentsResult === undefined ||
    allFaqsResult === undefined ||
    linkedFaqsResult === undefined;

  const activeEnrollments = enrollments.filter((e) => e.status === "pending");
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed",
  );

  const handleFieldSave = async (field: string) => {
    if (!course) return;
    try {
      const res = await updateCourse({
        courseId,
        [field]: field === "tuitionFee" ? Number(editValue) : editValue,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Course updated");
        setIsEditing(false);
        setEditingField(null);
      }
    } catch (error) {
      toast.error("Failed to update course");
    }
  };

  const toggleActive = async () => {
    if (!course) return;
    try {
      const res = await updateCourse({
        courseId,
        isActive: !course.isActive,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success(
          course.isActive ? "Course deactivated" : "Course activated",
        );
      }
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  const handleLinkFaq = async (faqId: Id<"faqs">) => {
    if (!course) return;
    const newFaqIds = [...(course.faqIds ?? []), faqId];
    try {
      const res = await updateCourseFaqs({ courseId, faqIds: newFaqIds });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ linked");
        setShowLinkFaqSheet(false);
      }
    } catch (error) {
      toast.error("Failed to link FAQ");
    }
  };

  const handleUnlinkFaq = async (faqId: Id<"faqs">) => {
    if (!course) return;
    const newFaqIds = (course.faqIds ?? []).filter((id) => id !== faqId);
    try {
      const res = await updateCourseFaqs({ courseId, faqIds: newFaqIds });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ unlinked");
      }
    } catch (error) {
      toast.error("Failed to unlink FAQ");
    }
  };

  const handleCreateFaq = async (data: {
    question: string;
    answer: string;
  }) => {
    try {
      const res = await createFaq({
        question: data.question,
        answer: data.answer,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("FAQ created");
        // Auto-link to this course
        const newFaqIds = [...(course?.faqIds ?? []), res.data];
        await updateCourseFaqs({ courseId, faqIds: newFaqIds });
        setShowFaqDialog(false);
      }
    } catch (error) {
      toast.error("Failed to create FAQ");
    }
  };

  // Get available FAQs (not yet linked)
  const availableFaqs = allFaqs.filter(
    (faq) => !(course?.faqIds ?? []).includes(faq._id),
  );

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Course not found
        </h2>
        <p className="mt-2 text-gray-500">
          The course you're looking for doesn't exist.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/admin/courses")}
          className="mb-8 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Course Details */}
          <div className="space-y-6 lg:col-span-1">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="bg-gray-50 px-6 py-8 text-center">
                <div className="mx-auto h-32 w-full max-w-[200px] overflow-hidden rounded-lg bg-gray-200">
                  {course.coverPhoto ? (
                    <img
                      src={course.coverPhoto}
                      alt={course.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <h1 className="mt-4 text-xl font-bold text-gray-900">
                  {course.name}
                </h1>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${course.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {course.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="border-t border-gray-100 px-6 py-6 space-y-4">
                {[
                  { label: "Duration", value: course.duration },
                  { label: "Certification", value: course.certification },
                  {
                    label: "Tuition Fee",
                    value: `$${course.tuitionFee.toLocaleString()}`,
                  },
                  { label: "Order", value: course.order.toString() },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 px-6 py-4">
                <Button
                  variant={course.isActive ? "outline" : "default"}
                  size="sm"
                  onClick={toggleActive}
                  className="w-full"
                >
                  {course.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Enrollments */}
          <div className="lg:col-span-2 space-y-8">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Enrollments
              </h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {enrollments.length} Enrollment
                {enrollments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeEnrollments.length}
                    </p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {completedEnrollments.length}
                    </p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Students</h2>
              </div>

              {enrollments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900">
                    No enrollments found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    No students have enrolled in this course yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Cohort
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Enrolled
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {enrollment.studentName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {enrollment.studentEmail}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {enrollment.cohortName}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${enrollment.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {enrollment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {enrollment.createdAt
                              ? new Date(
                                enrollment.createdAt,
                              ).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>



            {/* FAQs Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">FAQs</h2>
                <Button size="sm" onClick={() => setShowLinkFaqSheet(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
              </div>

              {linkedFaqs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No FAQs linked to this course yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedFaqs.map((faq) => (
                    <div
                      key={faq._id}
                      className="rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {faq.question}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {faq.answer}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnlinkFaq(faq._id)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <FaqDialog
          isOpen={showFaqDialog}
          onOpenChange={setShowFaqDialog}
          onSubmit={handleCreateFaq}
        />

        <LinkFaqsSheet
          isOpen={showLinkFaqMenu}
          onOpenChange={setShowLinkFaqSheet}
          availableFaqs={availableFaqs}
          linkedFaqs={linkedFaqs}
          onLink={handleLinkFaq}
          onUnlink={handleUnlinkFaq}
          onCreateNew={() => {
            setShowLinkFaqSheet(false);
            setShowFaqDialog(true);
          }}
        />
      </div>
    </div>
  );
}
