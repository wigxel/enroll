"use client";

import { useEffect, useImperativeHandle, useRef } from "react";

/**
 * Cloudflare Turnstile widget.
 *
 * Wraps Cloudflare's explicit-render API rather than its automatic `cf-turnstile`
 * class scan, because the token has to reach react-hook-form state rather than a
 * hidden input the framework never sees.
 *
 * The token this produces proves nothing by itself — it is redeemed server-side
 * in `convex/talentRequests.ts`. See `lib/turnstile.helpers.ts`.
 */

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
  callback?: (token: string) => void;
  "error-callback"?: (code: string) => void;
  "expired-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
      ) => string | undefined;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/** Cloudflare requires this exact URL — proxying or self-hosting it breaks on their updates. */
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * One in-flight load shared by every mount.
 *
 * Module-level so remounting the form (or rendering two widgets) reuses the same
 * `<script>` instead of racing a second copy of the API onto the page. Cleared on
 * failure so a later mount can retry rather than inheriting a dead promise.
 */
let scriptPromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () =>
      reject(new Error("Failed to load the Turnstile script")),
    );

    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
};

export type TurnstileHandle = {
  /**
   * Discards the current token and shows a fresh challenge. Tokens are
   * single-use, so the form must call this after every submit attempt.
   */
  reset: () => void;
};

export interface TurnstileProps {
  siteKey: string;
  /** Fires with a fresh token each time the visitor clears the challenge. */
  onVerify: (token: string) => void;
  /** Fires when the token passes its 300-second lifetime unused. */
  onExpire?: () => void;
  /** Fires on a challenge error, and if the Cloudflare script cannot load at all. */
  onError?: (code: string) => void;
  /** Labels the form in Cloudflare's analytics — useful once a second form exists. */
  action?: string;
  theme?: "auto" | "light" | "dark";
  className?: string;
  ref?: React.Ref<TurnstileHandle>;
}

export function Turnstile(props: TurnstileProps) {
  const {
    siteKey,
    onVerify,
    onExpire,
    onError,
    action,
    theme = "light",
    className,
    ref,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  /**
   * Callbacks live in a ref so the render effect can depend only on `siteKey`.
   * Turnstile hands its callbacks to Cloudflare's script once, at render time,
   * and re-rendering the widget whenever the parent passes a new inline arrow
   * would throw away a solved challenge on every keystroke in the form.
   */
  const handlers = useRef({ onVerify, onExpire, onError });
  useEffect(() => {
    handlers.current = { onVerify, onExpire, onError };
  }, [onVerify, onExpire, onError]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current) {
        window.turnstile?.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !siteKey) return;

    // Guards the async gap below: an unmount (or StrictMode's second effect run)
    // must not render a widget into a container React has already detached.
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;

        widgetIdRef.current =
          window.turnstile.render(container, {
            sitekey: siteKey,
            theme,
            action,
            callback: (token) => handlers.current.onVerify(token),
            "expired-callback": () => handlers.current.onExpire?.(),
            "error-callback": (code) => handlers.current.onError?.(code),
          }) ?? null;
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error(error);
        // Surface it as a widget error so the form can explain itself instead of
        // leaving a blank space where the challenge should be.
        handlers.current.onError?.("script-load-failed");
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, action]);

  return <div ref={containerRef} className={className} />;
}
