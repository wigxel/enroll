"use client";

import { Clock, Loader2, X } from "lucide-react";
import {
  usePendingInvitations,
  useRevokeInvitation,
} from "~/hooks/use-invitations";
import { cn } from "~/lib/utils";

const roleBadgeStyles: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800",
  Staff: "bg-indigo-100 text-indigo-800",
  Auditor: "bg-orange-100 text-orange-800",
};

export function PendingInvitations() {
  const { data: pendingInvites, isLoading, error } = usePendingInvitations();
  const revokeInvitation = useRevokeInvitation();

  const handleRevokeInvite = async (invitationId: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    revokeInvitation.mutate(invitationId, {
      onError: (err) => alert(err.message),
    });
  };

  return (
    <div className="mt-8 rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Pending Invitations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Users who have been invited but haven't signed up yet.
          </p>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Pending Role
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Invited On
              </th>
              <th className="relative py-2.5 pl-3 pr-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-sm text-red-500"
                >
                  {error.message}
                </td>
              </tr>
            ) : !pendingInvites?.length ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  No pending invitations.
                </td>
              </tr>
            ) : (
              pendingInvites.map((invite) => {
                const roleName =
                  (invite.public_metadata?.pendingRole as string) || "Unknown";
                return (
                  <tr key={invite.id}>
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {invite.email_address}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          roleBadgeStyles[roleName] ??
                            "bg-gray-100 text-gray-800",
                        )}
                      >
                        {roleName}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(invite.created_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => handleRevokeInvite(invite.id)}
                        disabled={revokeInvitation.isPending}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-40"
                        title="Revoke Invitation"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
