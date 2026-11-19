import type { Metadata } from "next";
import { DestExamRunner } from "@/components/typing/dest-exam-runner";

export const metadata: Metadata = {
  title: "Official SSC CGL & CHSL DEST Exam Typing Simulator | SSPH",
  description:
    "Simulate official SSC CGL Tier-II (15 min / 2000 keystrokes) and CHSL Tier-II (10 min / 1750 keystrokes) DEST typing tests with authentic commission error formula and qualifying evaluation.",
  keywords: [
    "SSC CGL DEST typing test online",
    "SSC CHSL typing test simulator",
    "SSC 2000 key depression test",
    "SSC typing speed test free",
    "SSC typing mistake calculation formula",
    "DEST typing test software online",
  ],
};

export default function TypingExamPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 dark:bg-[#070D18]">
      <DestExamRunner />
    </div>
  );
}
