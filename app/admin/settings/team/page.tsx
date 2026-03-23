"use client";

import { AdminUsersTable } from "~/components/admin/AdminUsersTable";
import { PendingInvitations } from "~/components/admin/PendingInvitations";

export default function TeamSettingsPage() {
  return (
    <>
      <AdminUsersTable />
      <PendingInvitations />
    </>
  );
}
