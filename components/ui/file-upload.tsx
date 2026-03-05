"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Upload, X, FileImage, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FileUploadProps {
  /** Called with the Convex storage ID after a successful upload */
  onUploadComplete: (storageId: Id<"_storage">) => void;
  /** Called when the user removes the uploaded file */
  onRemove?: () => void;
  /** Accepted MIME types — defaults to images */
  accept?: string;
  /** Max file size in bytes — defaults to 5 MB */
  maxSize?: number;
  /** Optional file URL to show the current/existing file preview */
  previewUrl?: string | null;
  /** Additional class names for the root container */
  className?: string;
  /** Whether the upload is disabled */
  disabled?: boolean;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "complete"; storageId: Id<"_storage">; previewUrl: string }
  | { status: "error"; message: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageType = (type: string) => type.startsWith("image/");

// ─── Component ───────────────────────────────────────────────────────────────

export function FileUpload({
  onUploadComplete,
  onRemove,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  previewUrl = null,
  className,
  disabled = false,
}: FileUploadProps) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>(
    previewUrl
      ? { status: "complete", storageId: "" as Id<"_storage">, previewUrl }
      : { status: "idle" },
  );
  const [isDragging, setIsDragging] = useState(false);

  // Sync the previewUrl prop into state when it resolves asynchronously
  // (e.g. from a useQuery call that returns undefined initially)
  useEffect(() => {
    if (previewUrl && state.status === "idle") {
      setState({
        status: "complete",
        storageId: "" as Id<"_storage">,
        previewUrl,
      });
    }
  }, [previewUrl, state.status]);

  // ── Upload logic ──────────────────────────────────────────────────────

  const uploadFile = useCallback(
    async (file: File) => {
      // Validation
      if (file.size > maxSize) {
        setState({
          status: "error",
          message: `File is too large. Maximum size is ${formatFileSize(maxSize)}.`,
        });
        return;
      }

      setState({ status: "uploading", progress: 0 });

      try {
        // Step 1 — get a short-lived upload URL from Convex
        const uploadUrl = await generateUploadUrl();
        setState({ status: "uploading", progress: 30 });

        // Step 2 — POST the file to the upload URL
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.statusText}`);
        }

        const { storageId } = (await result.json()) as {
          storageId: Id<"_storage">;
        };
        setState({ status: "uploading", progress: 90 });

        // Step 3 — create a local preview
        const previewUrl = isImageType(file.type)
          ? URL.createObjectURL(file)
          : "";

        setState({ status: "complete", storageId, previewUrl });
        onUploadComplete(storageId);
      } catch (err) {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Upload failed.",
        });
      }
    },
    [generateUploadUrl, maxSize, onUploadComplete],
  );

  // ── Drag & drop handlers ──────────────────────────────────────────────

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [disabled, uploadFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset the input so re-selecting the same file works
      e.target.value = "";
    },
    [uploadFile],
  );

  const handleRemove = useCallback(() => {
    setState({ status: "idle" });
    onRemove?.();
  }, [onRemove]);

  // ── Render ────────────────────────────────────────────────────────────

  // Completed state — show preview
  if (state.status === "complete" && state.previewUrl) {
    return (
      <div className={cn("relative", className)}>
        <div className="group relative overflow-hidden rounded-lg border border-gray-200">
          <img
            src={state.previewUrl}
            alt="Uploaded file"
            className="h-40 w-full object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1. text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Completed state — non-image file
  if (state.status === "complete") {
    return (
      <div className={cn("relative", className)}>
        <div className="group flex items-center gap-3 rounded-lg border border-gray-200 p-3">
          <FileImage className="h-8 w-8 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
            File uploaded
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          disabled && "pointer-events-none opacity-50",
          state.status === "error" && "border-red-300 bg-red-50",
        )}
      >
        {state.status === "uploading" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-gray-600">Uploading…</p>
          </>
        ) : (
          <>
            <Upload
              className={cn(
                "h-8 w-8",
                state.status === "error" ? "text-red-400" : "text-gray-400",
              )}
            />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                <span className="text-primary">Click to upload</span> or drag
                and drop
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Max {formatFileSize(maxSize)}
              </p>
            </div>
          </>
        )}

        {state.status === "error" && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {state.message}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
