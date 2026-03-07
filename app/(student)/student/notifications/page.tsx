"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: string;
  href: string;
}

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function useNotifications(): (Notification & { _id: string })[] {
  const data = useQuery(api.notifications.list, { filter: "all" });
  if (!data) return [];

  return data.notifications.map((n) => ({
    id: n._id,
    _id: n._id,
    title: n.title,
    body: n.body,
    timestamp: n.createdAt,
    isRead: n.isRead,
    type: n.type,
    href: getNotificationHref(n.type, n.relatedEntityId),
  }));
}

function getNotificationHref(type: string, relatedEntityId?: string) {
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
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
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
      return "📋";
    case "enrollment_completed":
      return "🎉";
    default:
      return "🔔";
  }
}

type FilterTab = "unread" | "all";

export default function NotificationsPage() {
  const allNotifications = useNotifications();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filteredNotifications =
    activeTab === "unread"
      ? allNotifications.filter((n) => !n.isRead)
      : allNotifications;

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const markAsRead = useMutation(api.notifications.markAsRead);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead({ notificationId: id as any });
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-gray-500">
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {(["unread", "all"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab}
            {tab === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="mt-4">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <Bell className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              You&apos;re all caught up!
            </p>
            <p className="mt-1 text-xs text-gray-400">
              No new notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.href}
                onClick={() => handleNotificationClick(notification._id, notification.isRead)}
                className={`flex gap-3 rounded-xl border p-4 transition-all hover:shadow-sm ${!notification.isRead
                  ? "border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.04]"
                  : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
              >
                <span className="mt-0.5 text-lg leading-none">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${!notification.isRead
                        ? "font-semibold text-gray-900"
                        : "font-medium text-gray-700"
                        }`}
                    >
                      {notification.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                    {notification.body}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
