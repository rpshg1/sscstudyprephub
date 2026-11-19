"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  Zap,
  CheckCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { TypingChapter } from "@/lib/typing/types";
import { getKeyFingerInfo } from "@/lib/typing/finger-mapping";
import { typingAudio } from "@/lib/typing/audio";
import { saveChapterProgress, calculateStars } from "@/lib/typing/storage";
import { HandsGuide } from "./hands-guide";
import { VirtualKeyboard } from "./virtual-keyboard";
import { PostureModal } from "./posture-modal";

interface TypingRunnerProps {
  chapter: TypingChapter;
}

export function TypingRunner({ chapter }: TypingRunnerProps) {
  const router = useRouter();
  const targetText = chapter.drillText;

  // Typing state
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakeIndices, setMistakeIndices] = useState<Set<number>>(new Set());
  const [totalErrors, setTotalErrors] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hidden input element ref for capturing keyboard input smoothly on desktop & mobile
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Current target character
  const currentIndex = typedText.length;
  const currentTargetChar = currentIndex < targetText.length ? targetText[currentIndex] : "";
  const activeFingerInfo = useMemo(() => getKeyFingerInfo(currentTargetChar), [currentTargetChar]);

  // Live Timer
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.max(1, Math.floor((Date.now() - startTime) / 1000)));
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted]);

  // Handle Mute toggle
  const toggleMute = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    typingAudio.setMuted(next);
  };

  // Metrics Calculation
  const minutes = Math.max(elapsedSeconds / 60, 0.05);
  const grossWpm = Math.round(typedText.length / 5 / minutes);
  const netWpm = Math.max(0, Math.round((typedText.length / 5 - totalErrors) / minutes));
  const accuracy =
    typedText.length > 0
      ? Math.max(0, Math.round(((typedText.length - totalErrors) / typedText.length) * 100))
      : 100;
  const progressPercent = Math.min(100, Math.round((typedText.length / targetText.length) * 100));

  // Reset drill
  const handleReset = useCallback(() => {
    setTypedText("");
    setStartTime(null);
    setElapsedSeconds(0);
    setMistakeIndices(new Set());
    setTotalErrors(0);
    setIsCompleted(false);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, []);

  // Completion trigger
  const handleComplete = useCallback(
    (finalTyped: string) => {
      setIsCompleted(true);
      const finalSec = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : 1;
      const finalMin = finalSec / 60;
      const finalWpm = Math.max(1, Math.round(finalTyped.length / 5 / finalMin));
      const finalAccuracy = Math.max(
        0,
        Math.round(((finalTyped.length - totalErrors) / finalTyped.length) * 100)
      );

      const stars = calculateStars(
        finalWpm,
        finalAccuracy,
        chapter.targetWpm,
        chapter.minAccuracy
      );

      saveChapterProgress(chapter.id, finalWpm, finalAccuracy, stars);
      typingAudio.playSuccessChime();
    },
    [chapter, startTime, totalErrors]
  );

  // Key Down Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isCompleted) return;

    // Reset shortcut: Esc
    if (e.key === "Escape") {
      e.preventDefault();
      handleReset();
      return;
    }

    // Ignore modifier keys
    if (
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta" ||
      e.key === "CapsLock"
    ) {
      return;
    }

    // Start timer on first keystroke
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Handle Backspace
    if (e.key === "Backspace") {
      if (typedText.length > 0) {
        setTypedText((prev) => prev.slice(0, -1));
      }
      return;
    }

    // Only process printable single character inputs
    if (e.key.length === 1) {
      const expected = targetText[typedText.length];
      const isCorrect = e.key === expected;

      if (isCorrect) {
        typingAudio.playKeyClick();
      } else {
        typingAudio.playErrorSound();
        setMistakeIndices((prev) => new Set(prev).add(typedText.length));
        setTotalErrors((prev) => prev + 1);
      }

      const nextTyped = typedText + e.key;
      setTypedText(nextTyped);

      // Check if finished
      if (nextTyped.length >= targetText.length) {
        handleComplete(nextTyped);
      }
    }
  };

  // Keep focus on input whenever user clicks anywhere inside practice box
  const ensureFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const starsEarned = calculateStars(
    netWpm,
    accuracy,
    chapter.targetWpm,
    chapter.minAccuracy
  );

  return (
    <div
      ref={containerRef}
      className={`mx-auto max-w-5xl transition-all ${
        isFullscreen ? "p-6 bg-slate-900 text-white min-h-screen" : "py-4 sm:py-6"
      }`}
    >
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/typing"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" /> Chapters
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Chapter {chapter.id} of 365
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Stage {chapter.stageNumber}: {chapter.stageTitle}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {chapter.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTutorialModal(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
            title="Posture & Hand Guide"
          >
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">Hand Tutorial</span>
          </button>

          <button
            onClick={toggleMute}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title={soundMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {soundMuted ? (
              <VolumeX className="h-4 w-4 text-slate-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-600" />
            )}
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Restart Drill (Esc)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Toggle Fullscreen Focus"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Real-time HUD Bar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Speed (Net WPM)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {netWpm}
            </span>
            <span className="text-xs text-slate-400">/ {chapter.targetWpm} target</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Accuracy
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-2xl font-extrabold ${
                accuracy >= chapter.minAccuracy
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-500"
              }`}
            >
              {accuracy}%
            </span>
            <span className="text-xs text-slate-400">/ {chapter.minAccuracy}% min</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Time Taken
          </span>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">
            {Math.floor(elapsedSeconds / 60)}:
            {(elapsedSeconds % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Progress
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
              <div
                className="h-full bg-blue-600 transition-all duration-150 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Typing Box */}
      <div
        onClick={ensureFocus}
        className="relative mt-4 cursor-text rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:border-slate-800 dark:bg-[#0B1220] dark:focus-within:border-blue-400 dark:focus-within:ring-blue-950/50 min-h-[160px] flex flex-col justify-center"
      >
        {/* Hidden capturing input */}
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value=""
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 opacity-0 cursor-default"
          aria-label="Touch typing input drill"
        />

        {/* Character Stream Display */}
        <div className="font-mono text-xl sm:text-2xl leading-relaxed tracking-wide select-none break-words">
          {targetText.split("").map((char, index) => {
            const isTyped = index < typedText.length;
            const isCurrent = index === typedText.length;
            const isMistake = mistakeIndices.has(index);

            let charClass = "text-slate-400 dark:text-slate-600";

            if (isTyped) {
              if (isMistake) {
                charClass =
                  "text-red-500 bg-red-100/80 rounded dark:bg-red-950/60 font-semibold";
              } else {
                charClass = "text-emerald-600 dark:text-emerald-400 font-semibold";
              }
            } else if (isCurrent) {
              charClass = "text-blue-600 dark:text-blue-400 font-bold underline decoration-2";
            }

            return (
              <span key={index} className={`relative ${charClass}`}>
                {isCurrent && (
                  <span className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-blue-600 animate-pulse dark:bg-blue-400" />
                )}
                {char === " " ? (
                  <span className={isCurrent ? "bg-blue-100 rounded px-1 dark:bg-blue-950" : ""}>
                    &nbsp;
                  </span>
                ) : (
                  char
                )}
              </span>
            );
          })}
        </div>

        {/* Floating guidance helper */}
        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Current Key:</span>
            <span className="inline-flex items-center justify-center rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white dark:bg-white dark:text-slate-900">
              {currentTargetChar === " " ? "Space" : currentTargetChar}
            </span>
            <span className="text-slate-400">•</span>
            <span>{activeFingerInfo.name}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Tip: Keep your eyes on the screen</span>
          </div>
        </div>
      </div>

      {/* Step Instructions Card */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950/60 dark:bg-blue-950/20">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-2">
          Chapter Instructions & How to Complete:
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
          {chapter.instructions.map((inst, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {idx + 1}
              </span>
              <span>{inst}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual Hands Guide Component */}
      <div className="mt-4">
        <HandsGuide activeFinger={activeFingerInfo.finger} currentKey={currentTargetChar} />
      </div>

      {/* Virtual Keyboard Component */}
      <div className="mt-4">
        <VirtualKeyboard currentKey={currentTargetChar} />
      </div>

      {/* Posture Tutorial Modal */}
      <PostureModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />

      {/* Lesson Complete Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>

            <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
              Chapter {chapter.id} Completed!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {chapter.title}
            </p>

            {/* Stars */}
            <div className="my-4 flex items-center justify-center gap-2">
              {[1, 2, 3].map((starIdx) => (
                <Award
                  key={starIdx}
                  className={`h-8 w-8 transition-transform duration-300 ${
                    starIdx <= starsEarned
                      ? "text-amber-400 fill-amber-400 scale-110"
                      : "text-slate-300 dark:text-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-900/70">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Net Speed</span>
                <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  {netWpm} WPM
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Accuracy</span>
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {accuracy}%
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Mistakes</span>
                <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  {totalErrors}
                </p>
              </div>
            </div>

            {/* Target Status */}
            <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              {accuracy >= chapter.minAccuracy && netWpm >= chapter.targetWpm ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Target criteria passed! Excellent muscle memory discipline.
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  Tip: Target was {chapter.targetWpm} WPM & {chapter.minAccuracy}% accuracy. Practice again to earn all 3 stars!
                </span>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                Retry Chapter
              </button>

              {chapter.id < 365 ? (
                <Link
                  href={`/typing/${chapter.id + 1}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Next Chapter <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/typing"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  All Chapters Complete!
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
