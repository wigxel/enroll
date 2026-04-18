"use client";

import { Clock, Users } from "lucide-react";

interface StudentEnrollment {
  _id: string;
  studentName: string;
  studentEmail: string;
  cohortName: string;
  status: "pending" | "completed" | "cancelled";
  createdAt?: string;
}

interface StudentsTableProps {
  enrollments: StudentEnrollment[];
}

export function StudentsTable({ enrollments }: StudentsTableProps) {
  if (enrollments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-sm font-medium text-gray-900">
          No enrollments found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          No students have enrolled in this course yet.
        </p>
      </div>
    );
  }

  return (
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
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    enrollment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {enrollment.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {enrollment.createdAt
                  ? new Date(enrollment.createdAt).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
