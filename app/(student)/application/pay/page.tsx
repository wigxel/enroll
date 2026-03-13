"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ApplicationPaymentPage = dynamic(() => import("./page.client"), {
  ssr: false,
});

export default function ApplicationPaymentPag() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationPaymentPage />
    </Suspense>
  );
}
