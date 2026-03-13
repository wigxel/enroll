"use client";

import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { safeArray } from "@/lib/data.helpers";
import { api } from "~/convex/_generated/api";
import type { Doc, Id } from "~/convex/_generated/dataModel";

type NotificationType =
  | "application_submitted"
  | "enrollment_completed"
  | "payment_failed"
  | "payment_disputed"
  | "application_stalled"
  | "quiz_failed"
  | "system_alert"
  | "payment_refund";

type Notification = Doc<"notifications">

const typeIcon: Record<string, React.ReactNode> = {
  application_submitted: <Info className="h-5 w-5 text-blue-500" />,
  enrollment_completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  payment_failed: <AlertCircle className="h-5 w-5 text-red-500" />,
  payment_disputed: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  application_stalled: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  quiz_failed: <AlertCircle className="h-5 w-5 text-red-500" />,
  payment_refund: <Info className="h-5 w-5 text-gray-500" />,
  system_alert: <Info className="h-5 w-5 text-gray-500" />,
};

function getNotificationLink(n: {
  relatedEntityId?: string;
  relatedEntityType?: string;
}): string | null {
  if (!n.relatedEntityId || !n.relatedEntityType) return null;
  switch (n.relatedEntityType) {
    case "application":
      return `/admin/applications/${n.relatedEntityId}`;
    case "payment":
      return `/admin/payments`;
    case "user":
      return `/admin/users`;
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");

  const resultRaw = useQuery(api.notifications.listAdmin, { filter });
  const unreadCountResult = useQuery(api.notifications.getUnreadCount, {});
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const archiveNotification = useMutation(api.notifications.archive);

  const notifications: Notification[] = safeArray((resultRaw as any)?.data?.notifications);
  const unreadCount = unreadCountResult?.success ? unreadCountResult.data : 0;
  const isLoading = resultRaw === undefined;

  const handleMarkAllAsRead = async () => {
    const res = await markAllAsRead({});
    if (!res.success) console.error("Failed to mark all as read:", res.error);
  };

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    await markAsRead({ notificationId: id });
  };

  const handleArchive = async (id: Id<"notifications">) => {
    const res = await archiveNotification({ notificationId: id });
    if (!res.success) console.error("Failed to archive:", res.error);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Notifications
            </h1>
            {(unreadCount ?? 0) > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Mark all as read
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
          {(["unread", "all", "archived"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${filter === f
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="mt-6 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <h3 className="text-sm font-medium text-gray-900">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const link = getNotificationLink(notification);

              return (
                <div
                  key={notification._id}
                  className={`rounded-md px-4 py-3 transition ${!notification.isRead ? "bg-primary/5" : "hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {typeIcon[notification.type] ?? (
                        <Info className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <h3
                          className={`text-sm ${!notification.isRead
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-700"
                            }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="ml-2 shrink-0 text-xs text-gray-400">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.body}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        {link && (
                          <Link
                            href={link}
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80"
                          >
                            View
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        )}
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleArchive(notification._id)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
