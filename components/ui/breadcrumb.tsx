import * as React from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string | readonly string[];
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
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
              <li>
                {isLink && href ? (
                  <Link
                    href={href as unknown as string}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-sm font-medium",
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
