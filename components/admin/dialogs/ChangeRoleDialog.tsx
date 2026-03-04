"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";

type AdminRole = "Super Admin" | "Staff" | "Auditor";
const allRoles: AdminRole[] = ["Super Admin", "Staff", "Auditor"];

interface ChangeRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: { id: string; name: string; role: AdminRole } | null;
    onSuccess?: () => void;
}

export function ChangeRoleDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: ChangeRoleDialogProps) {
    const [newRole, setNewRole] = useState<AdminRole>("Staff");

    useEffect(() => {
        if (user) setNewRole(user.role);
    }, [user]);

    const handleConfirm = () => {
        // TODO: call admin.changeRole({ userId: user.id, newRole })
        console.log("Change role", user?.id, "to", newRole);
        onOpenChange(false);
        onSuccess?.();
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Role</DialogTitle>
                    <DialogDescription>
                        Change <strong>{user.name}</strong>&apos;s role from{" "}
                        <strong>{user.role}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        New Role
                    </label>
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as AdminRole)}
                        className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        {allRoles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>
                <p className="rounded-md bg-yellow-50 p-3 text-xs text-yellow-800">
                    ⚠️ Changing a user&apos;s role will immediately affect their access and
                    permissions.
                </p>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={newRole === user.role}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        Confirm
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
