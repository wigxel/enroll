import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TURNSTILE_SITEVERIFY_URL,
  TURNSTILE_TOKEN_MAX_LENGTH,
  turnstileErrorMessage,
  verifyTurnstileToken,
} from "~/lib/turnstile.helpers";

const SECRET = "1x0000000000000000000000000000000AA";
const TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

/** Stands in for a siteverify reply. */
const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => body,
  }) as Response;

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  // The helper logs every failure path; keep the test output readable.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  mockFetch.mockReset();
});

describe("verifyTurnstileToken", () => {
  it("accepts a token Cloudflare confirms", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ success: true, "error-codes": [] }),
    );

    await expect(
      verifyTurnstileToken({ token: TOKEN, secret: SECRET }),
    ).resolves.toEqual({ success: true });
  });

  it("posts the secret and token form-encoded to the documented endpoint", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true }));

    await verifyTurnstileToken({ token: TOKEN, secret: SECRET });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(TURNSTILE_SITEVERIFY_URL);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );

    const body = new URLSearchParams(init.body);
    expect(body.get("secret")).toBe(SECRET);
    // Cloudflare names the token field `response`, not `token`.
    expect(body.get("response")).toBe(TOKEN);
  });

  it("passes through the error codes Cloudflare returns", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ success: false, "error-codes": ["timeout-or-duplicate"] }),
    );

    await expect(
      verifyTurnstileToken({ token: TOKEN, secret: SECRET }),
    ).resolves.toEqual({
      success: false,
      errorCodes: ["timeout-or-duplicate"],
    });
  });

  it("names the gap when a rejection arrives with no error codes", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ success: false, "error-codes": [] }),
    );

    await expect(
      verifyTurnstileToken({ token: TOKEN, secret: SECRET }),
    ).resolves.toEqual({ success: false, errorCodes: ["unknown-error"] });
  });

  it("rejects an empty token without calling Cloudflare", async () => {
    await expect(
      verifyTurnstileToken({ token: "", secret: SECRET }),
    ).resolves.toEqual({
      success: false,
      errorCodes: ["missing-input-response"],
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects an oversized token without calling Cloudflare", async () => {
    const oversized = "x".repeat(TURNSTILE_TOKEN_MAX_LENGTH + 1);

    await expect(
      verifyTurnstileToken({ token: oversized, secret: SECRET }),
    ).resolves.toEqual({
      success: false,
      errorCodes: ["invalid-input-response"],
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects a missing secret without calling Cloudflare", async () => {
    await expect(
      verifyTurnstileToken({ token: TOKEN, secret: "" }),
    ).resolves.toEqual({
      success: false,
      errorCodes: ["missing-input-secret"],
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("treats a non-2xx reply as an internal error rather than a pass", async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, false, 500));

    await expect(
      verifyTurnstileToken({ token: TOKEN, secret: SECRET }),
    ).resolves.toEqual({ success: false, errorCodes: ["internal-error"] });
  });

  it("does not throw when the network fails", async () => {
    mockFetch.mockRejectedValue(new Error("ECONNRESET"));

    await expect(
      verifyTurnstileToken({ token: TOKEN, secret: SECRET }),
    ).resolves.toEqual({ success: false, errorCodes: ["internal-error"] });
  });

  it("does not throw when the reply is not JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("Unexpected token < in JSON");
      },
    } as unknown as Response);

    await expect(
      verifyTurnstileToken({ token: TOKEN, secret: SECRET }),
    ).resolves.toEqual({ success: false, errorCodes: ["internal-error"] });
  });
});

describe("turnstileErrorMessage", () => {
  it("tells the visitor to retry when their token went stale", () => {
    expect(turnstileErrorMessage(["timeout-or-duplicate"])).toMatch(/expired/i);
    expect(turnstileErrorMessage(["invalid-input-response"])).toMatch(
      /expired/i,
    );
  });

  it("stays neutral when the fault is ours, not the visitor's", () => {
    // Asking someone to re-tick the box cannot fix our bad secret key.
    for (const code of [
      "missing-input-secret",
      "invalid-input-secret",
      "bad-request",
      "internal-error",
      "unknown-error",
    ]) {
      expect(turnstileErrorMessage([code])).not.toMatch(/expired/i);
      expect(turnstileErrorMessage([code])).toMatch(/could not verify/i);
    }
  });

  it("prefers the retryable message when codes are mixed", () => {
    expect(
      turnstileErrorMessage(["internal-error", "timeout-or-duplicate"]),
    ).toMatch(/expired/i);
  });
});
