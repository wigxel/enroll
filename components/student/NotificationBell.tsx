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

// TODO: Replace with Convex hook e.g. useQuery(api.notifications.getUnreadCount)
function useUnreadCount() {
  return 3;
}

// TODO: Replace with Convex hook e.g. useQuery(api.notifications.listOwn)
function useRecentNotifications(): Notification[] {
  return [
    {
      id: "n1",
      title: "Application Approved",
      body: "Congratulations! Your application has been approved. Begin your enrollment now.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      type: "application_status_change",
      href: "/enrollment",
    },
    {
      id: "n2",
      title: "Payment Confirmed",
      body: "Your application fee of ₦15,000 has been received.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
      type: "payment_received",
      href: "/application/status",
    },
    {
      id: "n3",
      title: "Tuition Payment Confirmed",
      body: "Your tuition payment of ₦250,000 has been received.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      type: "tuition_payment_received",
      href: "/enrollment",
    },
  ];
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
            href="/notifications"
            className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            View all notifications →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
