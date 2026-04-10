"use client";

import { useMutation, useQuery } from "convex/react";
import { GripVertical, Plus, X } from "lucide-react";
import { Reorder } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useDebounceCallback } from "~/hooks/use-debounce-callback";

interface PrerequisiteItem {
  key: string;
  value: string;
}

interface PrerequisitesSectionProps {
  courseId: Id<"courses">;
}

export function PrerequisitesSection({ courseId }: PrerequisitesSectionProps) {
  const courseResult = useQuery(api.courses.getById, { courseId });
  const updateCourse = useMutation(api.courses.update);

  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [localPrereqs, setLocalPrereqs] = useState<PrerequisiteItem[]>([]);

  const course = courseResult?.success ? courseResult.data : null;
  const prerequisites: PrerequisiteItem[] = course?.prerequisites ?? [];

  useEffect(() => {
    setLocalPrereqs(prerequisites);
  }, [prerequisites]);

  const debouncedUpdate = useDebounceCallback(
    async (newPrerequisites: PrerequisiteItem[]) => {
      try {
        const res = await updateCourse({
          courseId,
          prerequisites: newPrerequisites,
        });
        if (!res.success) {
          toast.error(res.error);
        } else {
          toast.success("Order updated");
        }
      } catch (error) {
        toast.error("Failed to reorder prerequisites");
      }
    },
    4000,
  );

  const handleReorder = (newPrerequisites: PrerequisiteItem[]) => {
    setLocalPrereqs(newPrerequisites);
    debouncedUpdate(newPrerequisites);
  };

  const handleAdd = async () => {
    if (!newPrerequisite.trim()) return;
    try {
      const newItem: PrerequisiteItem = {
        key: crypto.randomUUID(),
        value: newPrerequisite.trim(),
      };
      const res = await updateCourse({
        courseId,
        prerequisites: [...prerequisites, newItem],
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        setNewPrerequisite("");
        toast.success("Prerequisite added");
      }
    } catch (error) {
      toast.error("Failed to add prerequisite");
    }
  };

  const handleRemove = async (key: string) => {
    const updated = prerequisites.filter((item) => item.key !== key);
    try {
      const res = await updateCourse({
        courseId,
        prerequisites: updated,
      });
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Prerequisite removed");
      }
    } catch (error) {
      toast.error("Failed to remove prerequisite");
    }
  };

  if (courseResult === undefined) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Prerequisites</h2>
        <span className="text-xs text-gray-500">
          {prerequisites.length} item{prerequisites.length !== 1 ? "s" : ""}
        </span>
      </div>

      {localPrereqs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500">No prerequisites added yet.</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={localPrereqs}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {localPrereqs.map((item) => (
            <Reorder.Item
              key={item.key}
              value={item}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="cursor-grab touch-none">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <span className="flex-1 text-sm text-gray-700">{item.value}</span>
              <button
                type="button"
                onClick={() => handleRemove(item.key)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Add a prerequisite..."
          value={newPrerequisite}
          onChange={(e) => setNewPrerequisite(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newPrerequisite.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
