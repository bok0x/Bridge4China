import type { Metadata } from "next";
import { BeforeChinaClient } from "./BeforeChinaClient";

export const metadata: Metadata = {
  title: "Before Coming to China — Student Preparation Guide | Bridge4China",
  description:
    "Everything you need to know before arriving in China as an international student. Checklist, documents, CSC tips, and more.",
};

export default function BeforeChinaPage() {
  return <BeforeChinaClient />;
}
