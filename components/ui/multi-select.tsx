"use client";

import { X } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
  avatarUrl?: string | null;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const getInitials = (label: string) => {
    return label
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== value));
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start font-normal",
              selected.length === 0 && "text-muted-foreground",
            )}
          >
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <div className="flex max-h-64 flex-col overflow-y-auto p-1">
            {options.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">
                No options available
              </p>
            ) : (
              options.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                    selected.includes(option.value) && "bg-accent",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => handleToggle(option.value)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  {option.avatarUrl ? (
                    <Avatar className="mr-2 h-6 w-6">
                      <AvatarImage src={option.avatarUrl} alt={option.label} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(option.label)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                      {getInitials(option.label)}
                    </span>
                  )}
                  {option.label}
                </label>
              ))
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t p-1">
              <button
                type="button"
                onClick={handleClear}
                className="w-full rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Clear all
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value);
            const label = option?.label ?? value;
            const avatarUrl = option?.avatarUrl;
            return (
              <span
                key={value}
                className="inline-flex items-center rounded-full bg-primary/10 pl-1 pr-1.5 py-0.5 text-xs font-medium text-primary"
              >
                {avatarUrl ? (
                  <Avatar className="mr-1 h-5 w-5">
                    <AvatarImage src={avatarUrl} alt={label} />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(label)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-medium text-primary">
                    {getInitials(label)}
                  </span>
                )}
                <span className="mr-1">{label.split(" - ")[0]}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemove(value, e)}
                  disabled={disabled}
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
