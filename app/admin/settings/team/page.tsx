"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { InviteAdminDialog } from "~/components/admin/dialogs/InviteAdminDialog";
import { ChangeRoleDialog } from "~/components/admin/dialogs/ChangeRoleDialog";

type AdminRole = "Super Admin" | "Staff" | "Auditor";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    joinedAt: string;
}

// Mock data — TODO: Replace with Convex queries
const mockAdminUsers: AdminUser[] = [
    { id: "a1", name: "Admin Owner", email: "owner@example.com", role: "Super Admin", joinedAt: "2025-01-01T10:00:00Z" },
    { id: "a2", name: "Staff Member", email: "staff@example.com", role: "Staff", joinedAt: "2025-08-10T10:00:00Z" },
    { id: "a3", name: "Finance Auditor", email: "auditor@example.com", role: "Auditor", joinedAt: "2025-10-05T10:00:00Z" },
];

const adminRoleBadge: Record<AdminRole, string> = {
    "Super Admin": "bg-purple-100 text-purple-800",
    Staff: "bg-indigo-100 text-indigo-800",
    Auditor: "bg-orange-100 text-orange-800",
};

export default function TeamSettingsPage() {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [roleChangeUser, setRoleChangeUser] = useState<AdminUser | null>(null);

    const handleRemoveAdmin = (userId: string) => {
        // TODO: call admin.remove({ userId })
        console.log("Remove admin", userId);
    };

    return (
        <>
            <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            Administrative Users
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage Super Admins, Staff, and Auditors who can access the admin
                            panel.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowInviteDialog(true)}
                        className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Invite
                    </button>
                </div>
                <div className="mt-4 overflow-hidden rounded-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="relative py-2.5 pl-3 pr-4">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockAdminUsers.map((admin) => (
                                <tr key={admin.id}>
                                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm">
                                        <div className="font-medium text-gray-900">
                                            {admin.name}
                                        </div>
                                        <div className="text-gray-500 text-xs">{admin.email}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${adminRoleBadge[admin.role]}`}
                                        >
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                                        {new Date(admin.joinedAt).toLocaleDateString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm">
                                        {admin.role !== "Super Admin" && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setRoleChangeUser(admin)}
                                                    className="text-gray-400 hover:text-primary"
                                                    title="Change Role"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAdmin(admin.id)}
                                                    className="text-gray-400 hover:text-red-600"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteAdminDialog
                open={showInviteDialog}
                onOpenChange={setShowInviteDialog}
            />

            <ChangeRoleDialog
                open={!!roleChangeUser}
                onOpenChange={(open) => { if (!open) setRoleChangeUser(null); }}
                user={roleChangeUser}
            />
        </>
    );
}
