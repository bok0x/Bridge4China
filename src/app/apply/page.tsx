import { Suspense } from "react";
import { ApplyClient } from "./ApplyClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Apply" };

export default function ApplyPage() {
  return (
    <Suspense>
      <ApplyClient />
    </Suspense>
  );
}
