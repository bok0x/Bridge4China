import { Metadata } from "next";
import QuizClient from "./QuizClient";

export const metadata: Metadata = {
  title: "Quantum Matching Report | Bridge4China",
  description:
    "Answer 20 intelligent questions and discover your perfect university and major in China. Free AI-powered matching.",
};

export default function QuizPage() {
  return <QuizClient />;
}
