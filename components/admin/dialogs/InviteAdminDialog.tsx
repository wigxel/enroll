"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

const ADMIN_ROLE_NAMES = ["Admin", "Staff", "Auditor"];

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("Staff");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rolesResult = useQuery(api.auth.listRoles);
  const sendInvite = useAction(api.invitations.sendInvite);

  const adminRoles = rolesResult?.success
    ? rolesResult.data.filter((r: any) => ADMIN_ROLE_NAMES.includes(r.name))
    : [];

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setSelectedRoleName("Staff");
    setError(null);
  };

  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    email.includes("@");

  const handleInvite = async () => {
    setError(null);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const res = await sendInvite({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roleName: selectedRoleName,
        redirectUrl: `${window.location.origin}${process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up"}`,
      });

      if (!res.success) throw new Error(res.error);

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            A Clerk invitation email will be sent. They'll automatically receive
            the selected role when they sign up.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="invite-first-name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="invite-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="invite-last-name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="invite-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="invite-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@example.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="invite-role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={selectedRoleName}
              onChange={(e) => setSelectedRoleName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {adminRoles?.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-xs text-red-700">
              {error}
            </p>
          )}
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
            disabled={!isValid || isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Sending…" : "Send Invitation"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
