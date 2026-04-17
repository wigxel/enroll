"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FastTrackRedirectProps {
  courseId: string;
}

export default function FastTrackRedirect() {
  const router = useRouter();
  const createFastTrack = useMutation(api.applications.createFastTrack);

  useEffect(() => {
    async function handleFastTrack() {
      try {
        const result = await createFastTrack({
          courseId: "courseId_placeholder" as any,
        });
        // Note: courseId will be passed via props in the final version
      } catch (e) {
        console.error(e);
      }
    }
    // handleFastTrack();
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div>
          <h3 className="text-lg font-semibold">
            Fast-tracking your application...
          </h3>
          <p className="text-sm text-gray-500">
            Since you've enrolled before, we're skipping the form.
          </p>
        </div>
      </div>
    </div>
  );
}
