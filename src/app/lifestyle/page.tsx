import type { Metadata } from "next";
import { LifestyleClient } from "./LifestyleClient";

export const metadata: Metadata = {
  title: "Student Life in China | Bridge4China",
  description:
    "Discover what makes studying in China a truly life-changing experience. Food, social life, health, staying connected, and everything in between.",
};

export default function LifestylePage() {
  return <LifestyleClient />;
}
