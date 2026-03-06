import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Verifies a Clerk/Svix webhook signature.
 *
 * Svix signs payloads with HMAC-SHA256.
 * Signature format:  HMAC_SHA256( "${svix-id}.${svix-timestamp}.${rawBody}" )
 * The secret stored in CLERK_WEBHOOK_SECRET starts with "whsec_" followed by
 * a base64-encoded 32-byte key.
 */
async function verifyWebhook(request: Request): Promise<unknown> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "CLERK_WEBHOOK_SECRET is not set in the Convex environment variables.",
    );
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error("Missing Svix headers.");
  }

  const body = await request.text();
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;

  // Decode the base64 secret (strip the "whsec_" prefix)
  const secretBytes = Uint8Array.from(
    atob(secret.replace(/^whsec_/, "")),
    (c) => c.charCodeAt(0),
  );

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );

  const computedSig = btoa(String.fromCharCode(...new Uint8Array(signature)));

  // Svix may send multiple signatures (comma-separated "v1,<base64>")
  const isValid = svixSignature
    .split(" ")
    .some((sig) => sig.replace(/^v1,/, "") === computedSig);

  if (!isValid) {
    throw new Error("Invalid webhook signature.");
  }

  return JSON.parse(body);
}

// ---------------------------------------------------------------------------
// HTTP Router
// ---------------------------------------------------------------------------

const http = httpRouter();

http.route({
  path: "/events/convex",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let payload: unknown;

    try {
      payload = await verifyWebhook(request);
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = payload as {
      type: string;
      data: Record<string, unknown>;
    };

    console.log("Clerk webhook received:", event.type);

    switch (event.type) {
      case "user.created":
        await ctx.runMutation(internal.webhooks.onUserCreated, {
          data: event.data,
        });
        break;

      case "user.updated":
        await ctx.runMutation(internal.webhooks.onUserUpdated, {
          data: event.data,
        });
        break;

      case "user.deleted":
        await ctx.runMutation(internal.webhooks.onUserDeleted, {
          data: event.data,
        });
        break;

      default:
        console.log("Unhandled Clerk event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
