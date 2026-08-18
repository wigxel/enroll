/**
 * Cloudflare Turnstile verification.
 *
 * Turnstile issues a token in the browser when a visitor clears the widget. The
 * token proves nothing on its own — it is just a string the client hands us, and
 * a scripted submitter can send any string it likes. The proof only exists once
 * we redeem the token against Cloudflare's siteverify endpoint from the server,
 * which is what this module does.
 *
 * Kept dependency-free so the Convex action and the unit tests run the same code
 * without a Convex deployment in the loop.
 */

/** Cloudflare requires this exact endpoint; it must not be proxied. */
export const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Cloudflare's documented ceiling on token length. Checking it here turns a
 * megabyte of junk from an outbound HTTP request into a local string compare.
 */
export const TURNSTILE_TOKEN_MAX_LENGTH = 2048;

export type TurnstileVerification =
  { success: true } | { success: false; errorCodes: string[] };

export type TurnstileVerifyParams = {
  /** The single-use token the widget produced in the browser. */
  token: string;
  /** The widget's secret key. Server-side only — never ships to the client. */
  secret: string;
};

/** Shape of the siteverify reply. Cloudflare hyphenates the error key. */
type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

/**
 * Redeems a token with Cloudflare.
 *
 * Never throws: a network failure or a malformed reply comes back as
 * `internal-error` so the caller can always return a result rather than
 * bubbling an exception up to the visitor as an unhandled error.
 *
 * `remoteip` and `idempotency_key` are both optional in Cloudflare's API and are
 * deliberately omitted — a Convex action has no reliable view of the visitor's
 * IP, and sending the wrong one is worse than sending none.
 */
export const verifyTurnstileToken = async (
  params: TurnstileVerifyParams,
): Promise<TurnstileVerification> => {
  const { token, secret } = params;

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }
  if (token.length > TURNSTILE_TOKEN_MAX_LENGTH) {
    return { success: false, errorCodes: ["invalid-input-response"] };
  }
  if (!secret) {
    return { success: false, errorCodes: ["missing-input-secret"] };
  }

  let response: Response;
  try {
    response = await fetch(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });
  } catch (error) {
    console.error("Turnstile siteverify request failed:", error);
    return { success: false, errorCodes: ["internal-error"] };
  }

  if (!response.ok) {
    console.error(`Turnstile siteverify returned HTTP ${response.status}`);
    return { success: false, errorCodes: ["internal-error"] };
  }

  let body: SiteverifyResponse;
  try {
    body = (await response.json()) as SiteverifyResponse;
  } catch (error) {
    console.error("Turnstile siteverify returned invalid JSON:", error);
    return { success: false, errorCodes: ["internal-error"] };
  }

  if (body.success) return { success: true };

  // An empty array would leave the caller with nothing to log, so name the gap.
  const errorCodes = body["error-codes"]?.length
    ? body["error-codes"]
    : ["unknown-error"];

  return { success: false, errorCodes };
};

/**
 * Codes that mean "this visitor's token is stale, a fresh one will work".
 *
 * Tokens live 300 seconds and are single-use, so a slow form fill or a
 * double-click lands here — the most common failure by far, and the only one the
 * visitor can actually resolve.
 */
const RETRYABLE_CODES = new Set([
  "invalid-input-response",
  "timeout-or-duplicate",
]);

/**
 * Turns siteverify error codes into copy for the form.
 *
 * Everything outside `RETRYABLE_CODES` is our misconfiguration (bad secret,
 * malformed request, Cloudflare outage) and telling a business owner to "try the
 * checkbox again" would be a lie, so those get a neutral message instead.
 */
export const turnstileErrorMessage = (errorCodes: string[]): string =>
  errorCodes.some((code) => RETRYABLE_CODES.has(code))
    ? "Your verification expired. Please complete it again and resubmit."
    : "We could not verify your submission. Please try again in a moment.";
