"use client";
import { useMediaQuery } from "hooks-ts";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { _isoDateTime } from "zod/v4/core";
import { safeStr } from "~/lib/data.helpers";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface BreadcrumbItem {
  label: string | null;
  icon?: React.ReactNode;
  href?: string | readonly string[];
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items: items_, className }: BreadcrumbProps) {
  const isMobile = useMediaQuery(
    "(max-width: 768px) and (orientation: portrait)",
  );

  const MoreOptionsDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-2 block">
        <MoreHorizontal size="1.2rem" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="border border-transparent">
        {items_.slice(0, items_.length - 1).map((e) => {
          return (
            <DropdownMenuItem key={e.label} asChild>
              <Link
                href={e.href as any}
                className="text-sm font-medium text-muted-foreground hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {e.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const items: BreadcrumbItem[] =
    isMobile && items_.length > 2
      ? items_.length > 1
        ? ([
            { label: null, icon: MoreOptionsDropdown, href: "#" },
            items_.at(-1),
          ] as BreadcrumbItem[])
        : items_
      : items_;

  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const href = item.href;
          const isLink = href && !isLast;
          const key = `${safeStr(item.label).toLowerCase().replace(/\s+/g, "-")}-${index}`;

          return (
            <React.Fragment key={key}>
              <li className="whitespace-nowrap flex items-center">
                {isLink && href ? (
                  <Link
                    href={href as any}
                    className="text-sm font-medium text-muted-foreground hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isLast
                        ? "text-gray-900 dark:text-white"
                        : "text-muted-foreground dark:text-gray-400",
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <div className="flex items-center text-gray-400">/</div>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
