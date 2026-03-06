import { action } from "./_generated/server";
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
  },
  handler: async (_ctx, args) => {
    await sendInvitation({
      emailAddress: args.email,
      publicMetadata: {
        pendingRole: args.roleName,
        invitedFirstName: args.firstName,
        invitedLastName: args.lastName,
      },
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
