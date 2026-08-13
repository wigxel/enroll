"use client";

import { Loader2 } from "lucide-react";

// TODO: implement fast-track redirect with courseId prop
// Will need: useMutation(api.applications.createFastTrack), useRouter, courseId prop
export default function FastTrackRedirect() {
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
