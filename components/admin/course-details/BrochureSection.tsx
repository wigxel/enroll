"use client";

import { useMutation, useQuery } from "convex/react";
import { FileText, FilePen, Loader2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface BrochureSectionProps {
  courseId: Id<"courses">;
}

export function BrochureSection({ courseId }: BrochureSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const courseResult = useQuery(api.courses.getById, { courseId });
  const updateCourse = useMutation(api.courses.update);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const course = courseResult?.success ? courseResult.data : null;
  const brochureUrl = course?.brochureUrl;

  const urlResult = useQuery(
    api.storage.getFileUrl,
    brochureUrl && !brochureUrl.startsWith("http")
      ? { storageId: brochureUrl as Id<"_storage"> }
      : "skip",
  );

  const resolvedUrl = useCallback(() => {
    if (!brochureUrl) return null;
    if (brochureUrl.startsWith("http")) return brochureUrl;
    return urlResult?.success ? urlResult.data : null;
  }, [brochureUrl, urlResult])();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const res = await generateUploadUrl();
      if (!res.success) throw new Error(res.error);

      const result = await fetch(res.data, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = (await result.json()) as {
        storageId: Id<"_storage">;
      };

      const updateRes = await updateCourse({
        courseId,
        brochureUrl: storageId,
      });

      if (!updateRes.success) {
        toast.error(updateRes.error);
      } else {
        toast.success("Brochure uploaded");
      }
    } catch (err) {
      toast.error("Failed to upload brochure");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove the brochure?")) return;

    try {
      const res = await updateCourse({
        courseId,
        brochureUrl: undefined,
      });

      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Brochure removed");
      }
    } catch (err) {
      toast.error("Failed to remove brochure");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Brochure</h2>
      </div>

      {brochureUrl && resolvedUrl ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <FilePen className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Course Brochure</p>
                <p className="text-sm text-gray-500">PDF Document</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                View
              </a>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6">
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-4">
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Upload a PDF
                  </button>
                  <p className="mt-1 text-xs text-gray-500">
                    or drag and drop (max 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}