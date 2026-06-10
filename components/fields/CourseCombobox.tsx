"use client";

import { Combobox, type ComboboxOption } from "~/components/ui/combobox";
import { api } from "~/convex/_generated/api";
import { useSearchCombobox } from "~/hooks/use-search-combobox";

interface CourseComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function CourseCombobox({
  value,
  onChange,
  placeholder = "Select a course...",
  disabled,
  clearable,
}: CourseComboboxProps) {
  const { setSearch, data, isLoading } = useSearchCombobox({
    queryFn: api.courses.searchForCombobox,
    queryKey: "courses",
  });

  const options: ComboboxOption[] = data.map((c: any) => ({
    value: c._id,
    label: c.name,
  }));

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Search courses..."
      emptyText="No courses found"
      disabled={disabled}
      clearable={clearable}
      loading={isLoading}
      onSearchChange={(val) => setSearch(val)}
    />
  );
}
