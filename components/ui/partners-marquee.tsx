"use client";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

export function PartnersMarquee() {
  const partnersResult = useQuery(api.partners.listActive);
  const partners = partnersResult?.success ? partnersResult.data : [];

  if (partners.length === 0) {
    return null;
  }

  const track = [...partners, ...partners];

  return (
    <div className="container overflow-hidden mx-auto">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
        Trusted by Industry leaders
      </p>

      <div className="relative flex">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background-100 dark:from-zinc-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background-100 dark:from-zinc-900 to-transparent pointer-events-none" />

        {/* Scrolling track */}
        <button
          type="button"
          className="appearance-none flex gap-6 whitespace-nowrap"
          style={{
            animation: "partners-marquee 28s linear infinite",
            willChange: "transform",
          }}
          onMouseEnter={(e) =>
            ((
              e.currentTarget as unknown as HTMLDivElement
            ).style.animationPlayState = "paused")
          }
          onMouseLeave={(e) =>
            ((
              e.currentTarget as unknown as HTMLDivElement
            ).style.animationPlayState = "running")
          }
        >
          {track.map((partner, i) => (
            <div
              key={`${partner._id}-${i >= partners.length ? "dup" : "orig"}`}
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 min-w-[140px] h-12 shrink-0"
            >
              {partner.logoUrl ? (
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  {partner.name}
                </span>
              )}
            </div>
          ))}
        </button>
      </div>

      <style>{`
        @keyframes partners-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
