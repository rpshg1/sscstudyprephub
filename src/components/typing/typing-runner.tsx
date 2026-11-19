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
  Eye,
  EyeOff,
  Keyboard,
  Hand,
  Sliders,
} from "lucide-react";
import { TypingChapter } from "@/lib/typing/types";
import { getKeyFingerInfo } from "@/lib/typing/finger-mapping";
import { typingAudio } from "@/lib/typing/audio";
import { saveChapterProgress, calculateStars } from "@/lib/typing/storage";
import { HandsGuide } from "./hands-guide";
import { VirtualKeyboard } from "./virtual-keyboard";
import { PostureModal } from "./posture-modal";
import { NewKeyModal } from "./new-key-modal";

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
  const [showNewKeyModal, setShowNewKeyModal] = useState(chapter.newKeys.length > 0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showVisualKeyboard, setShowVisualKeyboard] = useState(true);
  const [showHandsGuide, setShowHandsGuide] = useState(true);

  // Hidden input element ref for capturing keyboard input smoothly on desktop & mobile
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
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
    if (isCompleted || showNewKeyModal || showTutorialModal) return;

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

  // Auto focus input on modal close
  const handleCloseNewKeyModal = () => {
    setShowNewKeyModal(false);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
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
      className={`mx-auto max-w-5xl transition-all duration-300 ${
        isFullscreen
          ? "p-6 bg-slate-950 text-white min-h-screen flex flex-col justify-center"
          : "py-4 sm:py-6"
      }`}
    >
      {/* Top Header / Breadcrumbs (Hidden in Zen/Focus Mode) */}
      {!focusMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/typing"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
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
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight">
                {chapter.title}
              </h1>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* New Key Guide Trigger Button */}
            {chapter.newKeys.length > 0 && (
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition-all active:scale-95"
                title="View Finger Placement for New Keys"
              >
                <Hand className="h-4 w-4 text-amber-600" />
                <span>Finger Guide ({chapter.newKeys.join(", ")})</span>
              </button>
            )}

            <button
              onClick={() => setShowTutorialModal(true)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
              title="Posture & Ergonomics Masterclass"
            >
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Posture</span>
            </button>

            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                focusMode
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  : "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
              title="Toggle Minimal Focus Mode"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Focus</span>
            </button>

            <button
              onClick={toggleMute}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
              title={soundMuted ? "Unmute Mechanical Sound" : "Mute Sound"}
            >
              {soundMuted ? (
                <VolumeX className="h-4 w-4 text-slate-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-600" />
              )}
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
              title="Restart Drill (Esc)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
              title="Toggle Fullscreen Mode"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Focus Mode Exit Floating Bar */}
      {focusMode && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zen Focus Mode</span>
            <span className="font-mono text-slate-500">• Ch. {chapter.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Restart (Esc)
            </button>
            <button
              onClick={() => setFocusMode(false)}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Exit Focus
            </button>
          </div>
        </div>
      )}

      {/* Real-time Minimalist HUD Bar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-2xs backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1220]/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Net Speed
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {netWpm}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {chapter.targetWpm} WPM</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-2xs backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1220]/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Accuracy
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                accuracy >= chapter.minAccuracy
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-500"
              }`}
            >
              {accuracy}%
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {chapter.minAccuracy}% min</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-2xs backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1220]/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Timer
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
            {Math.floor(elapsedSeconds / 60)}:
            {(elapsedSeconds % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-2xs backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1220]/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Progress
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-150 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Typing Canvas */}
      <div
        onClick={ensureFocus}
        className="relative mt-4 cursor-text rounded-3xl border-2 border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:border-slate-800/90 dark:bg-[#0B1220] dark:focus-within:border-blue-400 dark:focus-within:ring-blue-950/50 min-h-[170px] flex flex-col justify-center select-none"
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
        <div
          ref={textDisplayRef}
          className="font-mono text-2xl sm:text-3xl leading-relaxed tracking-wide select-none break-words"
        >
          {targetText.split("").map((char, index) => {
            const isTyped = index < typedText.length;
            const isCurrent = index === typedText.length;
            const isMistake = mistakeIndices.has(index);

            let charClass = "text-slate-400/80 dark:text-slate-600";

            if (isTyped) {
              if (isMistake) {
                charClass =
                  "text-rose-500 bg-rose-50 rounded px-0.5 underline decoration-rose-500 decoration-2 dark:bg-rose-950/50 font-bold";
              } else {
                charClass = "text-emerald-600 dark:text-emerald-400 font-semibold";
              }
            } else if (isCurrent) {
              charClass = "text-blue-600 dark:text-blue-400 font-extrabold";
            }

            return (
              <span key={index} className={`relative ${charClass}`}>
                {/* Glowing Smooth Caret Cursor */}
                {isCurrent && (
                  <span className="absolute -left-0.5 top-1 bottom-1 w-0.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)] animate-[pulse_1s_ease-in-out_infinite] dark:bg-blue-400" />
                )}
                {char === " " ? (
                  <span className={isCurrent ? "bg-blue-100/70 rounded px-1.5 dark:bg-blue-950/60" : ""}>
                    &nbsp;
                  </span>
                ) : (
                  char
                )}
              </span>
            );
          })}
        </div>

        {/* Bottom Micro Guidance Pill */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Target Key:
            </span>
            <span className="inline-flex items-center justify-center rounded-md bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-xs dark:bg-white dark:text-slate-900">
              {currentTargetChar === " " ? "␣ Space" : currentTargetChar}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {activeFingerInfo.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Press <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">Esc</kbd> to restart</span>
          </div>
        </div>
      </div>

      {/* Guided Visual Toggles (Hidden in Focus Mode) */}
      {!focusMode && (
        <>
          {/* Quick Visibility Switch Bar */}
          <div className="mt-4 flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-600" />
              Interactive Guides & On-Screen Aids
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHandsGuide(!showHandsGuide)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                  showHandsGuide
                    ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Hand className="h-3.5 w-3.5" />
                <span>Hands</span>
              </button>

              <button
                onClick={() => setShowVisualKeyboard(!showVisualKeyboard)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                  showVisualKeyboard
                    ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span>Keyboard</span>
              </button>
            </div>
          </div>

          {/* Hands Guide Component */}
          {showHandsGuide && (
            <div className="mt-2 transition-all duration-200">
              <HandsGuide activeFinger={activeFingerInfo.finger} currentKey={currentTargetChar} />
            </div>
          )}

          {/* Virtual Keyboard Component */}
          {showVisualKeyboard && (
            <div className="mt-3 transition-all duration-200">
              <VirtualKeyboard currentKey={currentTargetChar} />
            </div>
          )}
        </>
      )}

      {/* New Key Introduction Modal */}
      <NewKeyModal
        isOpen={showNewKeyModal}
        onClose={handleCloseNewKeyModal}
        newKeys={chapter.newKeys}
        chapterNumber={chapter.id}
        chapterTitle={chapter.title}
      />

      {/* Posture Tutorial Modal */}
      <PostureModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />

      {/* Lesson Complete Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl dark:border-slate-800 dark:bg-[#0B1220]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-9 w-9" />
            </div>

            <h3 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
              Chapter {chapter.id} Completed!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {chapter.title}
            </p>

            {/* Stars */}
            <div className="my-5 flex items-center justify-center gap-2">
              {[1, 2, 3].map((starIdx) => (
                <Award
                  key={starIdx}
                  className={`h-9 w-9 transition-transform duration-300 ${
                    starIdx <= starsEarned
                      ? "text-amber-400 fill-amber-400 scale-110 drop-shadow-md"
                      : "text-slate-200 dark:text-slate-800"
                  }`}
                />
              ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-900/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net WPM</span>
                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {netWpm}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy</span>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {accuracy}%
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mistakes</span>
                <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                  {totalErrors}
                </p>
              </div>
            </div>

            {/* Target Status */}
            <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
              {accuracy >= chapter.minAccuracy && netWpm >= chapter.targetWpm ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Target Passed! Clean muscle memory maintained.
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Target: {chapter.targetWpm} WPM &amp; {chapter.minAccuracy}% accuracy. Retry anytime for 3 stars!
                </span>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
              >
                Retry Chapter
              </button>

              {chapter.id < 365 ? (
                <Link
                  href={`/typing/${chapter.id + 1}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Next Chapter <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/typing"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
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
