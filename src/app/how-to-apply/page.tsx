import type { Metadata } from "next";
import { HowToApplyClient } from "./HowToApplyClient";

export const metadata: Metadata = {
  title: "How to Apply to Chinese Universities | Bridge4China",
  description:
    "Step-by-step guide to applying for a university in China. From research to visa arrival — we walk you through every stage.",
};

export default function HowToApplyPage() {
  return <HowToApplyClient />;
}
