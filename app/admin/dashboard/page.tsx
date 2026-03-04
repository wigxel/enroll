import React from "react";
import { Users, FileText, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { ApplicationsTable, DashboardApplication } from "@/components/admin/ApplicationsTable";

// Mock data hooks
// TODO: Replace with Convex hooks e.g. useQuery(api.applications.getDashboardStats)
function useDashboardStats() {
    return {
        totalApplications: 124,
        pendingReview: 12,
        approvedThisMonth: 48,
        declinedThisMonth: 8,
    };
}

// TODO: Replace with Convex hooks e.g. useQuery(api.applications.listPending)
function usePendingApplications(): DashboardApplication[] {
    return [
        {
            id: "app_1",
            applicantName: "Jane Doe",
            email: "jane.doe@example.com",
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            paymentStatus: "paid",
            status: "submitted",
        },
        {
            id: "app_2",
            applicantName: "John Smith",
            email: "john.smith@example.com",
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            paymentStatus: "pending",
            status: "under_review",
        },
        {
            id: "app_3",
            applicantName: "Alice Johnson",
            email: "alice.j@example.com",
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            paymentStatus: "paid",
            status: "submitted",
        },
        {
            id: "app_4",
            applicantName: "Bob Williams",
            email: "bwills@example.com",
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
            paymentStatus: "failed",
            status: "submitted",
        },
    ];
}

export default function AdminDashboardPage() {
    const stats = useDashboardStats();
    const pendingApplications = usePendingApplications();

    const statCards = [
        {
            name: "Total Applications",
            value: stats.totalApplications,
            icon: Users,
        },
        {
            name: "Pending Review",
            value: stats.pendingReview,
            icon: FileText,
            trend: { value: "3", isPositive: false }, // example: 3 more pending than usual
        },
        {
            name: "Approved (This Month)",
            value: stats.approvedThisMonth,
            icon: CheckCircle,
            trend: { value: "12%", isPositive: true },
        },
        {
            name: "Declined (This Month)",
            value: stats.declinedThisMonth,
            icon: XCircle,
        },
    ];

    return (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
                {/* Stats Row */}
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((item) => (
                        <StatCard key={item.name} {...item} />
                    ))}
                </dl>

                {/* Pending Applications Section */}
                <div className="mt-10">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Pending Applications
                            </h2>
                            <p className="mt-2 text-sm text-gray-700">
                                A prioritized list of submitted and under-review applications
                                awaiting your action.
                            </p>
                        </div>
                    </div>
                    <ApplicationsTable applications={pendingApplications} />
                </div>
            </div>
        </div>
    );
}
