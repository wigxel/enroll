"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";

type AdminRole = "Super Admin" | "Staff" | "Auditor";

interface InviteAdminDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function InviteAdminDialog({
    open,
    onOpenChange,
    onSuccess,
}: InviteAdminDialogProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<AdminRole>("Staff");

    const handleInvite = () => {
        // TODO: call admin.invite({ email, role })
        console.log("Invite admin", email, role);
        setEmail("");
        setRole("Staff");
        onOpenChange(false);
        onSuccess?.();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Administrative User</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join as an admin panel member.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="staff@example.com"
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as AdminRole)}
                            className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="Staff">Staff</option>
                            <option value="Auditor">Auditor</option>
                            <option value="Super Admin">Super Admin</option>
                        </select>
                    </div>
                </div>
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
                        onClick={handleInvite}
                        disabled={!email}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        Send Invite
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
