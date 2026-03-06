"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Plus, Pencil, Trash2, Loader2, X, Clock } from "lucide-react";
import { InviteAdminDialog } from "~/components/admin/dialogs/InviteAdminDialog";
import { ChangeRoleDialog } from "~/components/admin/dialogs/ChangeRoleDialog";
import { useAction } from "convex/react";
import { useEffect } from "react";

const ADMIN_ROLE_NAMES = ["Admin", "Staff", "Auditor"];

const roleBadgeStyles: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800",
  Staff: "bg-indigo-100 text-indigo-800",
  Auditor: "bg-orange-100 text-orange-800",
};

export default function TeamSettingsPage() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<{
    id: Id<"users">;
    name: string;
    role: string;
    roleId: Id<"roles">;
  } | null>(null);

  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);

  const getPendingInvites = useAction(api.invitations.getPendingInvites);
  const revokeInvite = useAction(api.invitations.revokeInvite);

  const fetchInvites = async () => {
    setIsLoadingInvites(true);
    try {
      const invites = await getPendingInvites();
      setPendingInvites(invites);
    } catch (err) {
      console.error("Failed to load invites:", err);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const roles = useQuery(api.auth.listRoles);
  const adminRoleIds = roles
    ?.filter((r) => ADMIN_ROLE_NAMES.includes(r.name))
    .map((r) => r._id);

  // We query all users and filter admin roles client-side, since we need
  // multiple role filters and the backend `list` supports one at a time.
  const usersResult = useQuery(api.users.list, {});
  const assignRole = useAction(api.users.assignRole);

  const adminUsers = usersResult?.users?.filter((u) =>
    adminRoleIds?.includes(u.role),
  );

  const handleRemoveAdmin = async (userId: Id<"users">) => {
    // "Removing" an admin means downgrading them to Applicant
    const applicantRole = roles?.find((r) => r.name === "Applicant");
    if (!applicantRole) return;

    if (
      !confirm(
        "Remove this user's admin access? They will be downgraded to Applicant.",
      )
    ) {
      return;
    }

    await assignRole({ userId, newRoleId: applicantRole._id });
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    try {
      await revokeInvite({ invitationId });
      await fetchInvites();
    } catch (err) {
      console.error("Failed to revoke invite:", err);
      alert("Failed to revoke invitation.");
    }
  };

  const isLoading = !roles || !usersResult;

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
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : adminUsers?.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No administrative users found.
                  </td>
                </tr>
              ) : (
                adminUsers?.map((admin) => (
                  <tr key={admin._id}>
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {admin.name}
                      </div>
                      <div className="text-gray-500 text-xs">{admin.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${roleBadgeStyles[admin.roleName ?? ""] ?? "bg-gray-100 text-gray-800"}`}
                      >
                        {admin.roleName}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm">
                      {admin.roleName !== "Admin" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setRoleChangeUser({
                                id: admin._id,
                                name: admin.name,
                                role: admin.roleName ?? "",
                                roleId: admin.role,
                              })
                            }
                            className="text-gray-400 hover:text-primary"
                            title="Change Role"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAdmin(admin._id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              {isLoadingInvites ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : pendingInvites.length === 0 ? (
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
                    (invite.public_metadata?.pendingRole as string) ||
                    "Unknown";
                  return (
                    <tr key={invite.id}>
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {invite.email_address}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${roleBadgeStyles[roleName] ?? "bg-gray-100 text-gray-800"}`}
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
                          className="text-gray-400 hover:text-red-600"
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

      <InviteAdminDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSuccess={fetchInvites}
      />

      {roleChangeUser && (
        <ChangeRoleDialog
          open={!!roleChangeUser}
          onOpenChange={(open) => {
            if (!open) setRoleChangeUser(null);
          }}
          user={roleChangeUser}
        />
      )}
    </>
  );
}
