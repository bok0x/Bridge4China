import type { Metadata } from "next";
import { CostOfLivingClient } from "./CostOfLivingClient";

export const metadata: Metadata = {
  title: "Cost of Living in China for Students | Bridge4China",
  description:
    "Compare monthly living costs across Chinese cities by tier. Housing, food, transport, and lifestyle budgets for international students.",
};

export default function CostOfLivingPage() {
  return <CostOfLivingClient />;
}
