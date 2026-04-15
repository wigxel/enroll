"use client";

import { useQuery } from "convex/react";
import { Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api } from "~/convex/_generated/api";

interface Testimonial {
  _id: string;
  text: string;
  rating: number;
  userName: string;
  userAvatar: string | null;
}

interface TestimonialsMarqueeProps {
  direction?: "left" | "right";
  speed?: number;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  try {
    return <>{children}</>;
  } catch {
    setHasError(true);
    return null;
  }
}

export function TestimonialsMarquee({
  direction = "left",
  speed = 30,
}: TestimonialsMarqueeProps) {
  return (
    <ErrorBoundary>
      <TestimonialsMarqueeInner direction={direction} speed={speed} />
    </ErrorBoundary>
  );
}

function TestimonialsMarqueeInner({
  direction,
  speed,
}: {
  direction: "left" | "right";
  speed: number;
}) {
  const result = useQuery(api.reviews.getForMarquee);
  const testimonials = result?.success ? result.data : [];

  if (testimonials.length === 0) {
    return null;
  }

  const track = [...testimonials, ...testimonials];
  const isPaused = false;

  return (
    <div className="container overflow-hidden mx-auto">
      <div className="relative flex">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent pointer-events-none" />

        <div
          className="flex gap-6 whitespace-nowrap"
          style={{
            animation: `testimonials-marquee ${speed}s linear infinite`,
            animationDirection: direction === "right" ? "reverse" : "normal",
            animationPlayState: isPaused ? "paused" : "running",
            willChange: "transform",
          }}
        >
          {track.map((t, i) => (
            <TestimonialCard key={`${t._id}-${i}`} testimonial={t} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes testimonials-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="inline-flex shrink-0 w-[320px] rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= testimonial.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold overflow-hidden">
            {testimonial.userAvatar ? (
              <Image
                src={testimonial.userAvatar}
                alt={testimonial.userName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {testimonial.userName}
          </span>
        </div>
      </div>
    </div>
  );
}