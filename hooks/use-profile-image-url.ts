"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface UseProfileImageUrlOptions {
  value?: string | null;
}

interface UseProfileImageUrlResult {
  url: string | null;
  isLoading: boolean;
  isStorageId: boolean;
}

export function useProfileImageUrl({
  value,
}: UseProfileImageUrlOptions): UseProfileImageUrlResult {
  const isStorageId = useMemo(() => {
    if (!value) return false;
    return !value.startsWith("http") && !value.startsWith("data:");
  }, [value]);

  const urlResult = useQuery(
    api.storage.getFileUrl,
    isStorageId && value ? { storageId: value as Id<"_storage"> } : "skip",
  );

  const url = useMemo(() => {
    if (!value) return null;
    if (!isStorageId) return value;
    return urlResult?.success ? urlResult.data : null;
  }, [value, isStorageId, urlResult]);

  return {
    url,
    isLoading: isStorageId && urlResult === undefined,
    isStorageId,
  };
}
