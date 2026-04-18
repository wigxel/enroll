"use client";

import { CheckCircle2, Clock } from "lucide-react";

interface EnrollmentStatsProps {
  activeCount: number;
  completedCount: number;
}

export function EnrollmentStats({
  activeCount,
  completedCount,
}: EnrollmentStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-2">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
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
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
