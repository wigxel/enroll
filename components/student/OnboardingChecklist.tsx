"use client";

import { useQuery } from "convex/react";
import { Check, GraduationCap, MinusIcon, X } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { cn, safeJsonParse } from "~/lib/utils";

interface Task {
  id: string;
  label: string;
  href?: string;
}

const TASKS: Task[] = [
  { id: "profile", label: "Complete your profile" },
  { id: "courses", label: "Explore your courses", href: "/student/courses" },
  {
    id: "enrollment",
    label: "Check enrollment details",
    href: "/student/enrollment",
  },
  {
    id: "certifications",
    label: "Browse certifications",
    href: "/student/certifications",
  },
];

export function OnboardingChecklist() {
  const router = useRouter();
  const userResult = useQuery(api.users.getCurrentUser);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const user = userResult?.success ? userResult.data : null;
  const userId = user?._id;

  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`onboarding_progress_${userId}`);
      if (saved) {
        setCompletedTasks(safeJsonParse(saved, []));
      }
    }
  }, [userId]);

  const toggleTask = (id: string) => {
    const newTasks = completedTasks.includes(id)
      ? completedTasks.filter((t) => t !== id)
      : [...completedTasks, id];

    setCompletedTasks(newTasks);
    if (userId) {
      localStorage.setItem(
        `onboarding_progress_${userId}`,
        JSON.stringify(newTasks),
      );
    }
  };

  const handleTaskClick = (task: Task) => {
    toggleTask(task.id);
    if (task.href) {
      router.push(task.href as any);
    }
  };

  if (!user) return null;

  const progress = (completedTasks.length / TASKS.length) * 100;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const icon = (
    <div className="flex items-center gap-3">
      {!isExpanded ? (
        <motion.span className="text-sm font-bold">
          <span className="text-red-600">{completedTasks.length}</span>
          <span className="text-gray-400"> / {TASKS.length}</span>
        </motion.span>
      ) : null}

      <div className="relative flex items-center justify-center">
        <svg className="h-10 w-10 transform -rotate-90">
          <title>Circular Progress</title>
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="text-red-500 transition-all duration-500 ease-out"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        // layout
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={cn(
          "overflow-hidden border border-gray-200 bg-white shadow-2xl transition-all duration-300 cursor-pointer",
          isExpanded
            ? "w-80 rounded-2xl p-5"
            : "rounded-2xl px-4 py-2 flex items-center gap-3",
        )}
      >
        <div className="relative w-full">
          <motion.div
            variants={{
              hide: {
                width: "100px",
                height: "2.5rem",
                opacity: 0,
              },
              show: {
                width: "100%",
                height: "auto",
                opacity: 1,
              },
            }}
            initial="hide"
            animate={!isExpanded ? "hide" : "show"}
            transition={{ duration: 0.2 }}
            style={{ transformOrigin: "bottom right" }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="absolute -right-2 -top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Collapse onboarding checklist"
            >
              <MinusIcon className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Almost there, {user.name.split(" ")[0]}!
              </h3>
            </div>

            <div className="space-y-3">
              {TASKS.map((task) => {
                const isCompleted = completedTasks.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTaskClick(task);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isCompleted}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                        isCompleted
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-gray-300 bg-white text-transparent",
                      )}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3px]" />
                    </div>
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        isCompleted
                          ? "text-red-600 font-medium"
                          : "text-gray-600",
                      )}
                    >
                      {task.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="absolute bottom-0 right-0">
            <div className="relative flex items-center justify-end">{icon}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
