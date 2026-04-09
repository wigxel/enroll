"use client";

const partners = [
  { name: "Google", color: "#4285F4", text: "#fff" },
  { name: "Microsoft", color: "#00A4EF", text: "#fff" },
  { name: "Amazon", color: "#FF9900", text: "#111" },
  { name: "Meta", color: "#0082FB", text: "#fff" },
  { name: "Netflix", color: "#E50914", text: "#fff" },
  { name: "Flutterwave", color: "#F5A623", text: "#111" },
  { name: "Paystack", color: "#00C3F7", text: "#fff" },
  { name: "Andela", color: "#2D2D7F", text: "#fff" },
  { name: "Interswitch", color: "#D32F2F", text: "#fff" },
  { name: "Binance", color: "#F0B90B", text: "#111" },
];

// Duplicate the list for a seamless infinite loop
const track = [...partners, ...partners];

export function PartnersMarquee() {
  return (
    <div className="container overflow-hidden mx-auto">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
        Trusted by Industry leaders
      </p>

      <div className="relative flex">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent pointer-events-none" />

        {/* Scrolling track */}
        <button
          type="button"
          className="appearance-none flex gap-6 whitespace-nowrap"
          style={{
            animation: "partners-marquee 28s linear infinite",
            willChange: "transform",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLDivElement).style.animationPlayState =
              "paused")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLDivElement).style.animationPlayState =
              "running")
          }
        >
          {track.map((partner, i) => (
            <div
              key={`${partner.name}`}
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 min-w-[140px] h-12 shrink-0 font-semibold text-sm tracking-tight shadow-sm select-none"
              style={{ backgroundColor: partner.color, color: partner.text }}
            >
              {partner.name}
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
