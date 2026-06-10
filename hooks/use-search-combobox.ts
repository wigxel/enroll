"use client";

import { useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { useState } from "react";
import { useDebounceCallback } from "./use-debounce-callback";

interface UseSearchComboboxOptions {
  queryFn: any;
  queryKey: string;
  debounceMs?: number;
  initialSearch?: string;
}

export function useSearchCombobox({
  queryFn,
  queryKey,
  debounceMs = 300,
  initialSearch = "",
}: UseSearchComboboxOptions) {
  const [search, setSearch] = useState(initialSearch);
  const convex = useConvex();

  const debouncedSearch = useDebounceCallback(
    (value: string) => setSearch(value),
    debounceMs,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["searchCombobox", queryKey, search],
    queryFn: async () => {
      const res = await convex.query(queryFn, { search });
      if (!res.success) throw new Error(res.error ?? "Search failed");
      return res.data;
    },
    enabled: true,
  });

  return {
    search,
    setSearch: debouncedSearch,
    data: (data ?? []) as any[],
    isLoading,
  };
}
