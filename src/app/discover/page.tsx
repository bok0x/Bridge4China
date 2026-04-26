import { Suspense } from "react";
import { DiscoverClient } from "./DiscoverClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discover Universities" };

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverClient />
    </Suspense>
  );
}
