"use client";

import { Slot } from "@radix-ui/react-slot";
import { useMutation } from "convex/react";
import { Camera, Loader2, User } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";

interface AvatarUploadProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  currentImageUrl?: string | null;
  onUploadComplete: (
    storageId: string | Id<"_storage">,
  ) => void | Promise<void>;
  size?: number;
  asChild?: boolean;
}

export function AvatarUpload({
  currentImageUrl,
  onUploadComplete,
  size = 80,
  asChild = false,
  className,
  disabled,
  ...props
}: AvatarUploadProps) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [internalImageUrl, setInternalImageUrl] = React.useState<string | null>(
    currentImageUrl ?? null,
  );

  React.useEffect(() => {
    if (currentImageUrl !== undefined) {
      setInternalImageUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const urlRes = await generateUploadUrl();
        if (!urlRes.success) throw new Error(urlRes.error);

        const uploadRes = await fetch(urlRes.data, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");

        const { storageId } = await uploadRes.json();

        const objectUrl = URL.createObjectURL(file);
        setInternalImageUrl(objectUrl);

        await onUploadComplete(storageId);
      } catch (err) {
        console.error("Upload failed:", err);
        alert(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [generateUploadUrl, onUploadComplete],
  );

  const avatarContent = (
    <div className={cn("relative inline-block", className)}>
      <div
        className="flex items-center justify-center rounded-full bg-primary/10 text-primary"
        style={{ width: size, height: size }}
      >
        {internalImageUrl ? (
          <img
            src={internalImageUrl}
            alt="Avatar"
            width={size}
            height={size}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ fontSize: size * 0.4 }}
          >
            <span className="font-medium text-primary">
              <User />
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
        disabled={disabled || uploading}
        className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ width: size * 0.4, height: size * 0.4 }}
      >
        {uploading ? (
          <Loader2
            className="animate-spin"
            style={{ width: size * 0.2, height: size * 0.2 }}
          />
        ) : (
          <Camera style={{ width: size * 0.2, height: size * 0.2 }} />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );

  if (asChild) {
    return (
      <Slot
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          if (!disabled && !uploading) {
            fileInputRef.current?.click();
          }
        }}
        {...props}
      >
        {avatarContent}
      </Slot>
    );
  }

  return avatarContent;
}
