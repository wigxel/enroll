"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { InviteAdminDialog } from "~/components/admin/dialogs/InviteAdminDialog";
import { invitationKeys } from "~/hooks/use-invitations";
import { queryClient } from "~/providers/react-query";

interface InviteButtonProps {
  /** Optional extra callback after a successful invite (e.g. for parent-level side effects). */
  onSuccess?: () => void;
}

/**
 * Self-contained Invite button — manages dialog open state and automatically
 * invalidates the pending invitations query after a successful send.
 */
export function InviteButton({ onSuccess }: InviteButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: invitationKeys.pending() });
    onSuccess?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Invite
      </button>
      <InviteAdminDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
