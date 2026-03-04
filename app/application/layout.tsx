"use client";

import { ReactNode } from "react";

export default function ApplicationLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-10 pb-20">
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
