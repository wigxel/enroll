import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "~/convex/_generated/api";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------
export const invitationKeys = {
  all: () => ["invitations"] as const,
  pending: () => ["invitations", "pending"] as const,
};

// ---------------------------------------------------------------------------
// usePendingInvitations
// Fetches pending Clerk invitations via the Convex action.
// ---------------------------------------------------------------------------
export function usePendingInvitations() {
  const convex = useConvex();

  return useQuery({
    queryKey: invitationKeys.pending(),
    queryFn: async () => {
      const res = await convex.action(api.invitations.getPendingInvites, {});
      if (!res.success)
        throw new Error(res.error ?? "Failed to fetch pending invitations.");
      return res.data as PendingInvite[];
    },
  });
}

// ---------------------------------------------------------------------------
// useRevokeInvitation
// Revokes a pending Clerk invitation and invalidates the pending list.
// ---------------------------------------------------------------------------
export function useRevokeInvitation() {
  const convex = useConvex();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await convex.action(api.invitations.revokeInvite, {
        invitationId,
      });
      if (!res.success)
        throw new Error(res.error ?? "Failed to revoke invitation.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.pending() });
    },
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PendingInvite {
  id: string;
  email_address: string;
  created_at: number;
  public_metadata?: {
    pendingRole?: string;
    [key: string]: unknown;
  };
}
