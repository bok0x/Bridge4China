import type { Metadata } from "next";
import { Suspense } from "react";
import { IQTestClient } from "./IQTestClient";

export const metadata: Metadata = {
  title: "Free IQ Test — 15-Minute Cognitive Assessment",
  description: "Test your IQ with a scientific 15-question adaptive cognitive assessment. See your score, percentile rank, and cognitive profile across 5 indices.",
};

export default function IQTestPage() {
  return (
    <Suspense>
      <IQTestClient />
    </Suspense>
  );
}
