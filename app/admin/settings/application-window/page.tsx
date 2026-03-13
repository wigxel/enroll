"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ApplicationWindowSettingsPage() {
  const settingsResult = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);

  const [isAccepting, setIsAccepting] = useState(true);
  const [openDate, setOpenDate] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settingsResult?.success && settingsResult.data) {
      setIsAccepting(settingsResult.data.isAcceptingApplications);
      setOpenDate(settingsResult.data.openDate || "");
      setCloseDate(settingsResult.data.closeDate || "");
    }
  }, [settingsResult]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSettings({
        isAcceptingApplications: isAccepting,
        openDate,
        closeDate,
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        toast.success("Settings saved successfully");
      } else {
        toast.error(res.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseImmediately = async () => {
    setIsAccepting(false);
    setIsSaving(true);
    try {
      const res = await updateSettings({
        isAcceptingApplications: false,
        openDate,
        closeDate,
      });
      if (res.success) {
        toast.success("Applications closed immediately");
      } else {
        toast.error(res.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to close applications");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-medium text-gray-900">
          Application Window
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Control when prospective students can submit new applications.
        </p>

        <div className="mt-6 space-y-6">
          {/* Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Accepting Applications
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAccepting
                  ? "New applications are currently being accepted"
                  : "Applications are currently closed"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAccepting(!isAccepting)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isAccepting ? "bg-primary" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAccepting ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>

          {/* Time-based Settings */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Open Date
              </label>
              <input
                type="datetime-local"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Close Date
              </label>
              <input
                type="datetime-local"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Manual Override */}
          <button
            type="button"
            onClick={handleCloseImmediately}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Close applications immediately
          </button>
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
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
