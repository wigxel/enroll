"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ApplicationStatusView } from "@/components/student/ApplicationStatusView";
import { Loader2 } from "lucide-react";

export default function ApplicationPendingPage() {
    const applicationResult = useQuery(api.applications.getMyApplication);

    const application = applicationResult?.success ? applicationResult.data : null;

    if (applicationResult === undefined) {
        return (
            <div className="flex flex-1 items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
                Application Status
            </h1>

            {application ? (
                <ApplicationStatusView application={application} />
            ) : (
                <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
                    <p className="text-gray-500">
                        {applicationResult?.success === false
                            ? applicationResult.error
                            : "No active application found."}
                    </p>
                </div>
            )}
        </div>
    );
}
