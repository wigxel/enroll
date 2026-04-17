"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { useProfileImageUrl } from "@/hooks/use-profile-image-url";

interface Classmate {
  userId: string;
  name: string;
  profileImage: string | null;
}

function ClassmateAvatar({
  profileImage,
  name,
  className,
}: {
  profileImage: string | null;
  name: string;
  className?: string;
}) {
  const { url } = useProfileImageUrl({ value: profileImage });

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-full bg-gray-100",
        className,
      )}
    >
      {url ? (
        <Image
          src={url}
          alt={name}
          width={100}
          height={100}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export function ClassmatesSection({ courseId }: { courseId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const result = useQuery(api.enrollments.getClassmates, { courseId });

  if (result === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Classmates
          </h2>
        </div>
        <div className="flex items-center gap-2 px-1">
          {[0, 1, 2, 3, 4].map((id) => (
            <div
              key={`skeleton-avatar-${id}`}
              className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"
              style={{ marginLeft: id === 0 ? 0 : "-12px" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const classmates: Classmate[] = result?.success ? result.data : [];

  if (classmates.length === 0) {
    return null;
  }

  const stackLimit = 5;
  const visibleInStack = classmates.slice(0, stackLimit);
  const remainingCount = classmates.length - stackLimit;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Classmates
          </h2>
        </div>
        {!isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-primary hover:text-primary/80"
          >
            View All
          </Button>
        )}
      </div>

      {!isExpanded ? (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden p-1">
            {visibleInStack.map((student) => (
              <ClassmateAvatar
                key={student.userId}
                profileImage={student.profileImage}
                name={student.name}
                className="h-10 w-10 ring-2 ring-background"
              />
            ))}
            {remainingCount > 0 && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ring-2 ring-background text-xs font-medium text-gray-600">
                +{remainingCount}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {classmates.length} students in this course
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classmates.map((student) => (
              <div
                key={student.userId}
                className="flex items-center gap-3 rounded-xl border border-gray-50 dark:border-zinc-900 p-2 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900"
              >
                <ClassmateAvatar
                  profileImage={student.profileImage}
                  name={student.name}
                  className="h-8 w-8"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {student.name}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Show Less
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
