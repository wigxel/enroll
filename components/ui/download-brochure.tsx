"use client";

import { Slot } from "@radix-ui/react-slot";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface DownloadBrochureProps {
  courseId: Id<"courses">;
  children: React.ReactNode;
  asChild?: boolean;
}

export function DownloadBrochure({
  courseId,
  children,
  asChild = true,
}: DownloadBrochureProps) {
  const courseResult = useQuery(api.courses.getById, { courseId });
  const brochureStorageId = courseResult?.success
    ? courseResult.data?.brochureUrl
    : null;

  const urlResult = useQuery(
    api.storage.getFileUrl,
    brochureStorageId &&
      typeof brochureStorageId === "string" &&
      !brochureStorageId.startsWith("http")
      ? { storageId: brochureStorageId as Id<"_storage"> }
      : "skip"
  );

  const brochureUrl = useMemo(() => {
    if (!brochureStorageId) return null;
    if (
      typeof brochureStorageId === "string" &&
      brochureStorageId.startsWith("http")
    ) {
      return brochureStorageId;
    }
    return urlResult?.success ? urlResult.data : null;
  }, [brochureStorageId, urlResult]);

  const isLoading =
    courseResult === undefined ||
    (!!brochureStorageId && urlResult === undefined);

  if (isLoading) {
    // Use any to bypass Slot typing issues - Radix Slot doesn't infer href propagation
    const Comp = asChild ? Slot : ("span" as any);
    return (
      <Comp className="pointer-events-none opacity-50" aria-disabled="true">
        {children}
      </Comp>
    );
  }

  if (!brochureUrl) {
    return null;
  }

  const Comp = asChild ? Slot : ("a" as any);

  return (
    <Comp
      href={brochureUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Comp>
  );
}
