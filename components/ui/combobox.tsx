"use client";

import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { safeStr } from "~/lib/data.helpers";
import { cn } from "~/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  secondary?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  onSearchChange?: (search: string) => void;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  disabled = false,
  loading = false,
  clearable = true,
  onSearchChange,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [triggerWidth, setTriggerWidth] = React.useState(0);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const captureRef = React.useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    if (node) setTriggerWidth(node.offsetWidth);
  }, []);

  React.useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const update = () => setTriggerWidth(el.offsetWidth);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();

    return () => ro.disconnect();
  }, []);

  console.log({ triggerWidth });

  const selected = React.useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const filtered = React.useMemo(
    () =>
      search
        ? options.filter(
            (o) =>
              safeStr(o.label).toLowerCase().includes(search.toLowerCase()) ||
              safeStr(o.secondary).toLowerCase().includes(search.toLowerCase()),
          )
        : options,
    [options, search],
  );

  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={captureRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : selected ? (
            <span className="truncate">{selected.label}</span>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        style={{ width: `${triggerWidth}px` } as React.CSSProperties}
      >
        <div className="flex items-center border-b px-3">
          <input
            className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearchChange?.(e.target.value);
            }}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(
                    option.value === value
                      ? clearable
                        ? null
                        : value
                      : option.value,
                  );
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center text-start gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  option.value === value && "bg-accent text-accent-foreground",
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    option.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                <div className="flex flex-col items-start">
                  <span>{option.label}</span>
                  {option.secondary && (
                    <span className="text-xs text-muted-foreground">
                      {option.secondary}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
