import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import {
  sendInvitation,
  getPendingInvitations,
  revokeInvitation,
} from "./clerk";

/**
 * Sends a Clerk invitation email for a new admin/staff member.
 * The invitee's role name is stored in `public_metadata.pendingRole` so that
 * `createOrGetUser` assigns the correct role automatically on first sign-in.
 */
export const sendInvite = action({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    roleName: v.string(),
    redirectUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    await sendInvitation({
      emailAddress: args.email,
      publicMetadata: {
        pendingRole: args.roleName,
        invitedFirstName: args.firstName,
        invitedLastName: args.lastName,
      },
      redirectUrl: args.redirectUrl,
    });

    return { success: true };
  },
});

/**
 * Retrieves a list of pending invitations from Clerk.
 */
export const getPendingInvites = action({
  args: {},
  handler: async () => {
    return await getPendingInvitations();
  },
});

/**
 * Revokes a pending Clerk invitation.
 */
export const revokeInvite = action({
  args: {
    invitationId: v.string(),
  },
  handler: async (_ctx, args) => {
    await revokeInvitation(args.invitationId);
    return { success: true };
  },
});

/**
 * Internal action: Sends an invite to an applicant to create their student account.
 */
export const sendStudentInvite = internalAction({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    applicationId: v.id("applications"),
  },
  handler: async (_ctx, args) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendInvitation({
      emailAddress: args.email,
      publicMetadata: {
        pendingRole: "Student",
        invitedFirstName: args.firstName,
        invitedLastName: args.lastName,
        applicationId: args.applicationId,
      },
      redirectUrl: `${appUrl}/sign-up`,
    });
  },
});
