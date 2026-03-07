/**
 * Clerk Backend API helpers for use inside Convex actions.
 *
 * All functions read CLERK_SECRET_KEY from the Convex environment.
 * Set it via: Convex Dashboard → Settings → Environment Variables.
 */

const CLERK_API = "https://api.clerk.com/v1";

function getSecretKey(): string {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "CLERK_SECRET_KEY is not set in the Convex environment variables.",
    );
  }
  return key;
}

async function clerkFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${CLERK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as { errors?: { long_message?: string; message?: string }[] })
        ?.errors?.[0]?.long_message ??
      (body as { errors?: { long_message?: string; message?: string }[] })
        ?.errors?.[0]?.message ??
      `Clerk API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------

export interface SendInvitationOptions {
  emailAddress: string;
  publicMetadata?: Record<string, unknown>;
  /** Automatically email the invitation. Default: true */
  notify?: boolean;
  redirectUrl?: string;
}

export async function sendInvitation(opts: SendInvitationOptions) {
  return clerkFetch("/invitations", {
    method: "POST",
    body: JSON.stringify({
      email_address: opts.emailAddress,
      public_metadata: opts.publicMetadata,
      notify: opts.notify ?? true,
      ...(opts.redirectUrl ? { redirect_url: opts.redirectUrl } : {}),
    }),
  });
}

export interface ClerkInvitation {
  id: string;
  email_address: string;
  status: "pending" | "accepted" | "revoked";
  public_metadata: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

/** Fetches pending invitations from Clerk. */
export async function getPendingInvitations() {
  const result = await clerkFetch<ClerkInvitation[]>(
    "/invitations?status=pending",
    { method: "GET" },
  );
  // The Clerk API returns an array directly for this endpoint
  // Or sometimes paginated depending on version, let's assume it returns an array
  // Wait, Clerk API V1 /invitations usually returns an array or an object with `data`.
  // The documentation says it returns an array of Invitation objects.
  return Array.isArray(result) ? result : (result as any).data || [];
}

/** Revokes a pending Clerk invitation by its ID. */
export async function revokeInvitation(invitationId: string) {
  return clerkFetch(`/invitations/${invitationId}/revoke`, {
    method: "POST",
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface UpdateUserMetadataOptions {
  userId: string;
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
}

/** Merge-patches a Clerk user's metadata. */
export async function updateUserMetadata(opts: UpdateUserMetadataOptions) {
  return clerkFetch(`/users/${opts.userId}/metadata`, {
    method: "PATCH",
    body: JSON.stringify({
      public_metadata: opts.publicMetadata,
      private_metadata: opts.privateMetadata,
    }),
  });
}

export interface CreateUserOptions {
  emailAddress: string;
  firstName: string;
  lastName: string;
}

/** Creates a Clerk user. */
export async function createUser(opts: CreateUserOptions) {
  return clerkFetch<{ id: string }>("/users", {
    method: "POST",
    body: JSON.stringify({
      email_address: [opts.emailAddress],
      first_name: opts.firstName,
      last_name: opts.lastName,
      skip_password_checks: true,
      skip_password_requirement: true,
    }),
  });
}

/** Deletes a Clerk user account. */
export async function deleteUser(clerkUserId: string) {
  return clerkFetch(`/users/${clerkUserId}`, { method: "DELETE" });
}
