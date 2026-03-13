import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

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

  const computedSig = btoa(
    Array.from(new Uint8Array(signature))
      .map((b) => String.fromCharCode(b))
      .join(""),
  );

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

// ---------------------------------------------------------------------------
// Paystack Webhook Handler
// ---------------------------------------------------------------------------

/**
 * Verifies a Paystack webhook signature using HMAC SHA-512 and IP Whitelisting
 */
async function verifyPaystackWebhook(request: Request): Promise<unknown> {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set in the Convex environment variables.",
    );
  }

  // 2. Signature Validation
  const paystackSignature = request.headers.get("x-paystack-signature");
  if (!paystackSignature) {
    throw new Error("Missing Paystack signature header.");
  }

  const body = await request.text();

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  const computedHash = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedHash !== paystackSignature) {
    throw new Error("Invalid Paystack webhook signature.");
  }

  return JSON.parse(body);
}

http.route({
  path: "/events/paystack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let payload: unknown;

    try {
      payload = await verifyPaystackWebhook(request);
    } catch (err) {
      console.error("Paystack webhook verification failed:", err);
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = payload as {
      event: string;
      data: Record<string, unknown>;
    };

    console.log("Paystack webhook received:", event.event);

    if (event.event === "charge.success") {
      await ctx.runMutation(internal.webhooks.onPaystackChargeSuccess, {
        data: event.data,
      });
    } else {
      console.log("Unhandled Paystack event type:", event.event);
    }

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
