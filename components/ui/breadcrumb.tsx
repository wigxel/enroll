"use client"
import { useMediaQuery } from "hooks-ts";
import Link from "next/link";
import * as React from "react";
import { cn } from "~/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string | readonly string[];
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items: items_, className }: BreadcrumbProps) {
  const isMobile = useMediaQuery("(max-width: 768px) and (orientation: portrait)");

  const items: BreadcrumbItem[] = isMobile
    ? items_.length > 1
      ? [items_.at(0), { label: "...", href: "#" }, items_.at(-1)] as BreadcrumbItem[]
      : items_
    : items_;

  console.log(items_);

  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const href = item.href;
          const isLink = href && !isLast;
          const key = `${item.label.toLowerCase().replace(/\s+/g, "-")}-${index}`;

          return (
            <React.Fragment key={key}>
              <li className="whitespace-nowrap">
                {isLink && href ? (
                  <Link
                    href={href as any}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isLast
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400",
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
