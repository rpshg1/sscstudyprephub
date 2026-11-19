"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  HelpCircle,
  Keyboard,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { getAllTypingStages, getChaptersForStage } from "@/lib/typing/curriculum";
import { loadUserTypingState } from "@/lib/typing/storage";
import { UserTypingState } from "@/lib/typing/types";
import { PostureModal } from "@/components/typing/posture-modal";

export default function TypingHubPage() {
  const stages = getAllTypingStages();
  const [selectedStageId, setSelectedStageId] = useState(1);
  const [userState, setUserState] = useState<UserTypingState | null>(null);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  useEffect(() => {
    setUserState(loadUserTypingState());
  }, []);

  const selectedStage = useMemo(
    () => stages.find((s) => s.id === selectedStageId) || stages[0],
    [stages, selectedStageId]
  );

  const stageChapters = useMemo(
    () => getChaptersForStage(selectedStageId),
    [selectedStageId]
  );

  // Overall statistics
  const completedCount = useMemo(() => {
    if (!userState) return 0;
    return Object.keys(userState.completedChapters).length;
  }, [userState]);

  const totalStars = useMemo(() => {
    if (!userState) return 0;
    return Object.values(userState.completedChapters).reduce(
      (acc, curr) => acc + (curr.stars || 0),
      0
    );
  }, [userState]);

  const bestSpeed = useMemo(() => {
    if (!userState) return 0;
    const wpms = Object.values(userState.completedChapters).map((c) => c.bestWpm || 0);
    return wpms.length > 0 ? Math.max(...wpms) : 0;
  }, [userState]);

  const nextChapterId = userState?.currentChapterId || 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 dark:bg-[#070D18]">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0B1220]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Zero to Professional • 365+ Progressive Chapters</span>
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
                Learn Touch Typing From Scratch
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base leading-relaxed">
                Step-by-step interactive typing curriculum designed for SSC aspirants (CGL & CHSL DEST 2000 keystrokes), banking, and central exam candidates. Master all 10 fingers with zero peeking.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/typing/${nextChapterId}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white" />
                  {completedCount === 0 ? "Start Chapter 1 (Free)" : `Resume Chapter ${nextChapterId}`}
                </Link>

                <button
                  onClick={() => setShowTutorialModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  Hand Placement Tutorial
                </button>

                <Link
                  href="/typing/exam"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-red-600" />
                  SSC DEST Exam Mode
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-center">
                <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {completedCount} <span className="text-xs text-slate-400">/ 365</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">Chapters Done</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-center">
                <div className="flex items-center justify-center text-amber-500 mb-1">
                  <Award className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalStars} <span className="text-xs text-slate-400">★</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">Stars Earned</div>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-center">
                <div className="flex items-center justify-center text-emerald-500 mb-1">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {bestSpeed} <span className="text-xs text-slate-400">WPM</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">Top Speed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stage Selector Tabs */}
        <div className="border-b border-slate-200 pb-2 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-blue-600" />
              Master Curriculum (8 Stages)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Select a stage to view its lessons
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {stages.map((stage) => {
              const isSelected = stage.id === selectedStageId;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      isSelected
                        ? "bg-white text-blue-600"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {stage.id}
                  </span>
                  <span>{stage.title}</span>
                  <span className="opacity-75 font-mono text-[10px]">({stage.chapterRange})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Banner */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Stage {selectedStage.id} • {selectedStage.badge}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Target: {selectedStage.targetWpmRange}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {selectedStage.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
                {selectedStage.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {selectedStage.totalChapters} Lessons in this Stage
              </span>
            </div>
          </div>
        </div>

        {/* Chapter Grid (365 Lessons) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {stageChapters.map((chapter) => {
            const prog = userState?.completedChapters[chapter.id];
            const isCompleted = !!prog?.completed;
            const stars = prog?.stars || 0;
            const isCurrent = chapter.id === nextChapterId;

            return (
              <Link
                key={chapter.id}
                href={`/typing/${chapter.id}`}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-md ${
                  isCurrent
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/20"
                    : isCompleted
                    ? "border-emerald-200 bg-white dark:border-emerald-900/40 dark:bg-slate-900/70"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#0F172A]"
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      Ch. {chapter.id}
                    </span>

                    {/* Stars */}
                    {isCompleted ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <span
                            key={s}
                            className={`text-xs ${
                              s <= stars ? "text-amber-400" : "text-slate-200 dark:text-slate-700"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    ) : isCurrent ? (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Next Up
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {chapter.title}
                  </h4>

                  {/* Keys Introduced */}
                  {chapter.newKeys.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        New:
                      </span>
                      {chapter.newKeys.map((k) => (
                        <span
                          key={k}
                          className="rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:border-amber-900/50 dark:text-amber-300"
                        >
                          {k === " " ? "␣ Space" : k.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Meta */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800">
                  <span>{chapter.targetWpm} WPM</span>
                  <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    {isCompleted ? "Practice" : "Start"} <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Posture Tutorial Modal */}
      <PostureModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />
    </div>
  );
}
