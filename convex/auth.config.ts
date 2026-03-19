import type { AuthConfig } from "convex/server";

/**
 * Tells Convex to accept JWTs issued by Clerk.
 * Set CLERK_JWT_ISSUER_DOMAIN in your Convex dashboard environment variables
 * (e.g. https://your-app.clerk.accounts.dev)
 */

if (!process.env.CLERK_JWT_ISSUER_DOMAIN) {
  throw new Error("CLERK_JWT_ISSUER_DOMAIN is not set");
}

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig
