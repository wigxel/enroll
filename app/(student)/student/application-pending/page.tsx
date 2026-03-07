"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ApplicationStatusView } from "@/components/student/ApplicationStatusView";
import { Loader2 } from "lucide-react";

export default function ApplicationPendingPage() {
    const application = useQuery(api.applications.getMyApplication);

    if (application === undefined) {
        return (
            <div className="flex flex-1 items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Application Status</h1>
            <ApplicationStatusView application={application} />
        </div>
    );
}
