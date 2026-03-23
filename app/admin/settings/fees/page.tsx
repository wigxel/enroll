"use client";

import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";

export default function FeesSettingsPage() {
  const settingsResult = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);

  const [applicationFee, setApplicationFee] = useState("0");
  const [isAccepting, setIsAccepting] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settingsResult?.success && settingsResult.data) {
      setApplicationFee(settingsResult.data.applicationFeeAmount.toString());
      setIsAccepting(settingsResult.data.isAcceptingApplications);
    }
  }, [settingsResult]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSettings({
        isAcceptingApplications: isAccepting,
        applicationFeeAmount: parseInt(applicationFee, 10) || 0,
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        toast.success("Fee settings saved successfully");
      } else {
        toast.error(res.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save fees");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-medium text-gray-900">Fee Configuration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Set the application fee amount. Tuition fees are configured per course
          on the{" "}
          <a
            href="/admin/courses"
            className="text-primary underline hover:text-primary/80"
          >
            Courses page
          </a>
          .
        </p>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Application Fee (₦)
          </label>
          <input
            type="number"
            value={applicationFee}
            onChange={(e) => setApplicationFee(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-2 text-xs text-gray-500">
            This fee is charged to all applicants when submitting their
            application.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-green-600">
            Settings saved successfully!
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || settingsResult === undefined}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
