"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationStatusRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/application-pending");
  }, [router]);

  return null;
}
