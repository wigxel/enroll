"use client";

import React, { useState } from "react";

export default function FeesSettingsPage() {
  const [applicationFee, setApplicationFee] = useState("15000");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: call config.updateFees({ applicationFee })
    console.log("Save fee settings", { applicationFee });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
