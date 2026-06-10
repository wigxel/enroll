"use client";

import { Combobox, type ComboboxOption } from "~/components/ui/combobox";
import { api } from "~/convex/_generated/api";
import { useSearchCombobox } from "~/hooks/use-search-combobox";

interface StudentComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function StudentCombobox({
  value,
  onChange,
  placeholder = "Select a student...",
  disabled,
  clearable,
}: StudentComboboxProps) {
  const { setSearch, data, isLoading } = useSearchCombobox({
    queryFn: api.students.searchForCombobox,
    queryKey: "students",
  });

  const options: ComboboxOption[] = data.map((s: any) => ({
    value: s._id,
    label: s.name,
    secondary: s.email,
  }));

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Search students..."
      emptyText="No students found"
      disabled={disabled}
      clearable={clearable}
      loading={isLoading}
      onSearchChange={(val) => setSearch(val)}
    />
  );
}
