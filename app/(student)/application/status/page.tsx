"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ApplicationStatusRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/application-pending");
  }, [router]);

  return null;
}
