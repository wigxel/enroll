"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

interface Instructor {
  _id: string;
  name: string;
  title: string;
  bio: string;
  photo?: string;
}

interface InstructorsSectionProps {
  instructors: Instructor[];
}

export function InstructorsSection({ instructors }: InstructorsSectionProps) {
  return (
    <section>
      <SectionHeading
        icon={<User className="h-5 w-5" />}
        title="Meet Your Instructors"
        subtitle="Learn from seasoned practitioners"
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {instructors.map((ins) => {
          const initials = ins.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          const colors = [
            "from-indigo-500 to-purple-600",
            "from-emerald-500 to-teal-600",
            "from-rose-500 to-pink-600",
            "from-amber-500 to-orange-600",
          ];
          const color = colors[ins.name.charCodeAt(0) % colors.length];
          return (
            <div
              key={ins._id}
              className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-background overflow-hidden"
            >
              <div className={`h-20 bg-linear-to-br ${color} relative`}>
                {ins.photo && (
                  <Image
                    src={ins.photo}
                    alt={ins.name}
                    fill
                    className="object-cover opacity-50"
                  />
                )}
                <div className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-md ring-2 ring-white dark:ring-zinc-900 overflow-hidden">
                  {ins.photo ? (
                    <Image
                      src={ins.photo}
                      alt={ins.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className={`bg-linear-to-br ${color} bg-clip-text text-transparent font-bold text-sm`}
                    >
                      {initials}
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-9 px-5 pb-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {ins.name}
                </h3>
                <p className="text-xs font-medium mt-0.5">{ins.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                  {ins.bio}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
