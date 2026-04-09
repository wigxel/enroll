import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { PartnersMarquee } from "~/components/ui/partners-marquee";

export default async function Home() {
  return (
    <main className="flex flex-col bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center min-h-[70svh]">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          Applications now open
        </div>

        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Launch your Culinary career with{" "}
          <span className="bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            world-class training
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-gray-500 dark:text-gray-400">
          Browse our industry-aligned programs, apply online, and join a
          community of graduates building the future of technology.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700"
          >
            Explore Programs
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/alumni"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800"
          >
            <GraduationCap className="h-4 w-4" />
            Meet Our Alumni
          </Link>
        </div>
      </div>

      {/* Partners Marquee */}
      <PartnersMarquee />
    </main>
  );
}
