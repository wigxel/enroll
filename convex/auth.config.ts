/**
 * Tells Convex to accept JWTs issued by Clerk.
 * Set CLERK_JWT_ISSUER_DOMAIN in your Convex dashboard environment variables
 * (e.g. https://your-app.clerk.accounts.dev)
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
