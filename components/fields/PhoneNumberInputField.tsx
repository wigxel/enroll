
import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface PhoneNumberInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
}

export function PhoneNumberInputField<T extends FieldValues>({
  control,
  name,
  label = "Phone Number",
  required = true,
}: PhoneNumberInputFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
