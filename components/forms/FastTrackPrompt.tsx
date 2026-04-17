"use client";

import { useMutation } from "convex/react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Id } from "~/convex/_generated/dataModel";

interface FastTrackPromptProps {
  courseId: Id<"courses">;
}

export default function FastTrackPrompt({ courseId }: FastTrackPromptProps) {
  const router = useRouter();
  const createFastTrack = useMutation(api.applications.createFastTrack);
  const [isLoading, setIsLoading] = useState(false);

  const handleFastTrack = async () => {
    setIsLoading(true);
    try {
      const result = await createFastTrack({ courseId });

      if (result.success) {
        toast.success("Application fast-tracked! Redirecting to payment...");
        router.push(`/application/pay?reference=${result.data}`);
      } else {
        toast.error(result.error || "Failed to fast-track application.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5 max-w-sm mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Zap className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription className="text-base"></CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground text-balance text-center">
          We'll use your existing profile information to create your application
          instantly.
        </p>
      </CardContent>

      <CardFooter className="flex justify-center pb-8">
        <Button onClick={handleFastTrack} disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            "Fast-Track Application & Pay"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper component for loader since I didn't import it
function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85 1.23 6.42 3.07L21 3" />
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}
