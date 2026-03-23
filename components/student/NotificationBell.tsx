"use client";
import { Bell } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: string;
  href: string;
}

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function useUnreadCount() {
  const result = useQuery(api.notifications.getUnreadCount);
  return result?.success ? result.data : 0;
}

function useRecentNotifications(): (Notification & { _id: string })[] {
  const result = useQuery(api.notifications.list, { filter: "all" });
  if (!result?.success) return [];

  const data = result.data;

  return data.notifications.map((n) => ({
    id: n._id,
    _id: n._id, // Add _id for mutation
    title: n.title,
    body: n.body,
    timestamp: n.createdAt,
    isRead: n.isRead,
    type: n.type,
    href: getNotificationHref(n.type, n.relatedEntityId),
  }));
}

function getNotificationHref(type: string, _relatedEntityId?: string) {
  switch (type) {
    case "application_status_change":
      return "/student/application-pending";
    case "payment_received":
      return "/student/application-pending";
    case "tuition_payment_received":
      return "/student/enrollment";
    case "enrollment_step_complete":
    case "enrollment_completed":
      return "/student/enrollment";
    default:
      return "/student/dashboard";
  }
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case "application_status_change":
      return "✅";
    case "payment_received":
    case "tuition_payment_received":
      return "💰";
    case "payment_refunded":
      return "↩️";
    case "enrollment_step_complete":
    case "enrollment_completed":
      return "📋";
    default:
      return "🔔";
  }
}

export function NotificationBell() {
  const unreadCount = useUnreadCount();
  const notifications = useRecentNotifications();
  const markAsRead = useMutation(api.notifications.markAsRead);

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        const res = await markAsRead({ notificationId: id as any });
        if (!res.success) console.error("Failed to mark as read:", res.error);
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 rounded-xl shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs font-medium text-primary">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() =>
                    handleNotificationClick(
                      notification._id,
                      notification.isRead,
                    )
                  }
                  className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-primary/[0.02]" : ""
                  }`}
                >
                  <span className="text-base leading-none mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          !notification.isRead
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {notification.body}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {getRelativeTime(notification.timestamp)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 p-2">
          <Link
            href="/student/notifications"
            className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            View all notifications →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
