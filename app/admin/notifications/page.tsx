"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type NotificationType =
    | "application_submitted"
    | "enrollment_completed"
    | "payment_failed"
    | "payment_disputed"
    | "application_stalled"
    | "quiz_failed"
    | "system_alert";

interface AdminNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    relatedEntityId?: string;
    relatedEntityType?: "application" | "user" | "payment";
    isRead: boolean;
    isArchived: boolean;
    createdAt: string;
}

// Mock data
const mockNotifications: AdminNotification[] = [
    {
        id: "n1", type: "application_submitted", title: "New Application Submitted",
        body: "Jane Doe has paid the application fee and is awaiting review.",
        relatedEntityId: "app_1", relatedEntityType: "application",
        isRead: false, isArchived: false, createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
        id: "n2", type: "payment_failed", title: "Payment Failed",
        body: "Bob Williams' payment attempt for Application Fee failed.",
        relatedEntityId: "p4", relatedEntityType: "payment",
        isRead: false, isArchived: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: "n3", type: "enrollment_completed", title: "Enrollment Completed",
        body: "Alice Johnson has completed all enrollment steps and is now a Student.",
        relatedEntityId: "u3", relatedEntityType: "user",
        isRead: true, isArchived: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: "n4", type: "application_stalled", title: "Application Stalled",
        body: "Carol Martinez's application has been awaiting review for over 7 days.",
        relatedEntityId: "app_5", relatedEntityType: "application",
        isRead: true, isArchived: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
        id: "n5", type: "quiz_failed", title: "Quiz Failed Max Attempts",
        body: "David Lee has failed the orientation assessment 3 times and may need assistance.",
        relatedEntityId: "u4", relatedEntityType: "user",
        isRead: false, isArchived: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
];

const typeIcon: Record<NotificationType, React.ReactNode> = {
    application_submitted: <Info className="h-5 w-5 text-blue-500" />,
    enrollment_completed: <CheckCircle className="h-5 w-5 text-green-500" />,
    payment_failed: <AlertCircle className="h-5 w-5 text-red-500" />,
    payment_disputed: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    application_stalled: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    quiz_failed: <AlertCircle className="h-5 w-5 text-red-500" />,
    system_alert: <Info className="h-5 w-5 text-gray-500" />,
};

function getNotificationLink(n: AdminNotification): string | null {
    if (!n.relatedEntityId || !n.relatedEntityType) return null;
    switch (n.relatedEntityType) {
        case "application":
            return `/admin/applications/${n.relatedEntityId}`;
        case "payment":
            return `/admin/payments`;
        case "user":
            return `/admin/students`;
        default:
            return null;
    }
}

export default function NotificationsPage() {
    const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");

    const filteredNotifications = useMemo(() => {
        return mockNotifications.filter((n) => {
            if (filter === "unread") return !n.isRead && !n.isArchived;
            if (filter === "archived") return n.isArchived;
            return !n.isArchived;
        });
    }, [filter]);

    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

    const handleMarkAllAsRead = () => {
        // TODO: call notifications.markAllAsRead()
        console.log("Mark all as read");
    };

    const handleMarkAsRead = (id: string) => {
        // TODO: call notifications.markAsRead({ notificationId: id })
        console.log("Mark as read", id);
    };

    const handleArchive = (id: string) => {
        // TODO: call notifications.archive({ notificationId: id })
        console.log("Archive", id);
    };

    return (
        <div className="py-8">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
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
                    {filteredNotifications.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                            <h3 className="text-sm font-medium text-gray-900">
                                No notifications
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You&apos;re all caught up!
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => {
                            const link = getNotificationLink(notification);
                            return (
                                <div
                                    key={notification.id}
                                    className={`rounded-lg bg-white p-4 shadow-sm transition ${!notification.isRead
                                            ? "border-l-4 border-l-primary"
                                            : "border-l-4 border-l-transparent"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex-shrink-0">
                                            {typeIcon[notification.type]}
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
                                                <span className="ml-2 flex-shrink-0 text-xs text-gray-400">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {notification.body}
                                            </p>
                                            <div className="mt-2 flex items-center gap-3">
                                                {link && (
                                                    <Link
                                                        href={link}
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80"
                                                    >
                                                        View
                                                        <ArrowRight className="ml-1 h-3 w-3" />
                                                    </Link>
                                                )}
                                                {!notification.isRead && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="text-xs text-gray-400 hover:text-gray-600"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleArchive(notification.id)}
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
