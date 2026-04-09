"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Plus,
  Star,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CreateEnrollmentForm } from "~/components/admin/forms/CreateEnrollmentForm";
import { AvatarUpload } from "~/components/ui/avatar-upload";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useProfileImageUrl } from "~/hooks/use-profile-image-url";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.student as Id<"users">;

  const studentResult = useQuery(api.users.getUser, { userId: studentId });
  const enrollmentsResult = useQuery(api.enrollments.listByUserId, {
    userId: studentId,
  });
  const cohortsResultRaw = useQuery(api.cohorts.list, {});
  const coursesResultRaw = useQuery(api.courses.listAll, {});
  const updateCohort = useMutation(api.enrollments.updateCohort);
  const setAlumniStatus = useMutation(api.users.setAlumniStatus);
  const updateUserProfile = useMutation(api.users.updateUserProfile);
  const createForStudent = useMutation(api.enrollments.createForStudent);

  const [updatingCohort, setUpdatingCohort] = useState<string | null>(null);
  const [updatingAlumni, setUpdatingAlumni] = useState(false);
  const [showAddEnrollment, setShowAddEnrollment] = useState(false);

  const handleCohortChange = async (
    enrollmentId: Id<"enrollments">,
    cohortId: string,
  ) => {
    setUpdatingCohort(enrollmentId);
    try {
      const res = await updateCohort({
        enrollmentId,
        cohortId: cohortId as Id<"cohorts">,
      });
      if (!res.success) {
        console.error("Failed to update cohort:", res.error);
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to update cohort:", error);
    } finally {
      setUpdatingCohort(null);
    }
  };

  const handleAlumniToggle = async () => {
    if (!student) return;
    setUpdatingAlumni(true);
    try {
      const res = await setAlumniStatus({
        userId: studentId,
        isAlumni: !student.isAlumni,
      });
      if (!res.success) {
        console.error("Failed to update alumni status:", res.error);
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to update alumni status:", error);
    } finally {
      setUpdatingAlumni(false);
    }
  };

  const handlePhotoUpload = async (storageId: string) => {
    const res = await updateUserProfile({
      userId: studentId,
      profileImage: storageId,
    });
    if (!res.success) {
      console.error("Failed to update profile:", res.error);
      alert(res.error);
    }
  };

  const handleCreateEnrollment = async (data: {
    cohortId: string;
    courseId: string;
    isPaid: boolean;
  }) => {
    try {
      const res = await createForStudent({
        userId: studentId,
        cohortId: data.cohortId as Id<"cohorts">,
        courseId: data.courseId as Id<"courses">,
        isPaid: data.isPaid,
      });
      if (!res.success) {
        console.error("Failed to create enrollment:", res.error);
        alert(res.error);
      } else {
        setShowAddEnrollment(false);
      }
    } catch (error) {
      console.error("Failed to create enrollment:", error);
    }
  };

  const handleCancelEnrollment = () => {
    setShowAddEnrollment(false);
  };

  const cohorts = !cohortsResultRaw?.success
    ? []
    : cohortsResultRaw.data?.cohorts;
  const courses = !coursesResultRaw?.success
    ? []
    : (coursesResultRaw.data ?? []);
  const student = studentResult?.success ? (studentResult.data ?? null) : null;
  const enrollments = enrollmentsResult?.success ? enrollmentsResult.data : [];
  const { url: profileImageUrl } = useProfileImageUrl({
    value: student?.profileImage,
  });

  if (
    studentResult === undefined ||
    enrollmentsResult === undefined ||
    cohortsResultRaw === undefined ||
    coursesResultRaw === undefined
  ) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (student === null) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Student not found
        </h2>
        <p className="mt-2 text-gray-500">
          The student record you're looking for doesn't exist.
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
          onClick={() => router.back()}
          className="mb-8 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Profile Card */}
          <div className="space-y-6 lg:col-span-1">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="bg-gray-50 px-6 py-8 text-center">
                <div className="mx-auto">
                  <AvatarUpload
                    currentImageUrl={profileImageUrl}
                    onUploadComplete={handlePhotoUpload}
                    size={80}
                  />
                </div>
                <h1 className="mt-4 text-xl font-bold text-gray-900">
                  {student.name}
                </h1>
                <p className="text-sm font-medium text-primary uppercase tracking-wider">
                  {student.roleName}
                </p>
                {(student.isAlumni || updatingAlumni) && (
                  <div className="mt-3">
                    {student.isAlumni ? (
                      <button
                        type="button"
                        onClick={handleAlumniToggle}
                        disabled={updatingAlumni}
                        className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50"
                      >
                        {updatingAlumni ? (
                          <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-amber-500 border-t-amber-700" />
                        ) : (
                          <Star className="mr-1 h-3 w-3" />
                        )}
                        Alumni
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAlumniToggle}
                        disabled={updatingAlumni}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-50"
                      >
                        {updatingAlumni ? (
                          <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-amber-600" />
                        ) : (
                          <Star className="mr-1 h-3 w-3" />
                        )}
                        Mark as Alumni
                      </button>
                    )}
                  </div>
                )}
                {!student.isAlumni && !updatingAlumni && (
                  <button
                    type="button"
                    onClick={handleAlumniToggle}
                    disabled={updatingAlumni}
                    className="mt-3 text-xs text-gray-400 hover:text-amber-600 disabled:opacity-50"
                  >
                    Mark as Alumni
                  </button>
                )}
              </div>
              <div className="border-t border-gray-100 px-6 py-6 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-3 h-4 w-4 text-gray-400" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-3 h-4 w-4 text-gray-400" />
                  <span>
                    Joined {new Date(student.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Enrollments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Enrollment History
              </h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {enrollments.length} Enrollment
                {enrollments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {enrollments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  No enrollments found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  This student hasn't started any enrollment processes yet.
                </p>
                {cohorts && cohorts.length > 0 && (
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddEnrollment(true)}
                      className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Cohort
                    </button>

                    {showAddEnrollment && (
                      <CreateEnrollmentForm
                        cohorts={cohorts}
                        courses={courses}
                        onSubmit={handleCreateEnrollment}
                        onCancel={handleCancelEnrollment}
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-primary/30"
                  >
                    <div className="border-b border-gray-50 bg-gray-50/50 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {enrollment.courseName}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <select
                              value={enrollment.cohortId ?? ""}
                              onChange={(e) =>
                                handleCohortChange(
                                  enrollment._id,
                                  e.target.value,
                                )
                              }
                              disabled={updatingCohort === enrollment._id}
                              className="block rounded-md border-0 py-1 pl-2 pr-8 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-xs sm:leading-6"
                            >
                              <option value="" disabled>
                                Select Cohort
                              </option>
                              {cohorts.map((cohort) => (
                                <option key={cohort._id} value={cohort._id}>
                                  {cohort.name}
                                </option>
                              ))}
                            </select>
                            {updatingCohort === enrollment._id && (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                            )}
                          </div>
                        </div>
                        <div
                          className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            enrollment.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {enrollment.status === "completed" ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {enrollment.status.charAt(0).toUpperCase() +
                            enrollment.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div className="flex flex-col space-y-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Tuition Fee
                          </span>
                          <div className="flex items-center text-sm font-medium">
                            {enrollment.steps.tuitionPaid ? (
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="mr-2 h-4 w-4 text-amber-500" />
                            )}
                            {enrollment.steps.tuitionPaid ? "Paid" : "Pending"}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Orientation Quiz
                          </span>
                          <div className="flex items-center text-sm font-medium">
                            {enrollment.steps.quizPassed ? (
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="mr-2 h-4 w-4 text-amber-500" />
                            )}
                            {enrollment.steps.quizPassed
                              ? "Passed"
                              : "Not Attempted"}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Documents
                          </span>
                          <div className="flex items-center text-sm font-medium">
                            {enrollment.steps.documentsSigned ? (
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="mr-2 h-4 w-4 text-amber-500" />
                            )}
                            {enrollment.steps.documentsSigned
                              ? "Signed"
                              : "Pending"}
                          </div>
                        </div>
                      </div>

                      {enrollment.completedAt && (
                        <div className="mt-6 border-t border-gray-50 pt-4 flex items-center text-xs text-gray-500">
                          <CheckCircle2 className="mr-1.5 h-3 w-3 text-green-500" />
                          Enrolled on{" "}
                          {new Date(
                            enrollment.completedAt,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
