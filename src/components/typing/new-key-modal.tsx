"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Hand,
  Keyboard,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { getKeyFingerInfo, FINGER_COLOR_MAP } from "@/lib/typing/finger-mapping";
import { typingAudio } from "@/lib/typing/audio";

interface NewKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  newKeys: string[];
  chapterNumber: number;
  chapterTitle: string;
}

export function NewKeyModal({
  isOpen,
  onClose,
  newKeys,
  chapterNumber,
  chapterTitle,
}: NewKeyModalProps) {
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [selectedKeyIndex, setSelectedKeyIndex] = useState(0);

  // Normalize keys
  const keysList = useMemo(() => {
    if (!newKeys || newKeys.length === 0) return ["f"];
    return newKeys;
  }, [newKeys]);

  const activeKey = keysList[selectedKeyIndex] || keysList[0];
  const fingerInfo = useMemo(() => getKeyFingerInfo(activeKey), [activeKey]);
  const colorData = FINGER_COLOR_MAP[fingerInfo.finger] || FINGER_COLOR_MAP["left-index"];

  // Listen for keyboard press to test new key or press Enter/Space to start
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter or Escape dismisses
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Check if user pressed one of the new keys
      const pressed = e.key;
      const matched = keysList.find(
        (k) =>
          (k === " " && pressed === " ") ||
          k.toLowerCase() === pressed.toLowerCase()
      );

      if (matched) {
        typingAudio.playKeyClick();
        setTestedKeys((prev) => new Set(prev).add(matched));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, keysList, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-[#0B1220] overflow-hidden">
        {/* Subtle decorative gradient glow behind */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Chapter {chapterNumber} • New Key Introduction</span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Meet Your New {keysList.length > 1 ? "Keys" : "Key"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Key Selection Pills if multiple keys */}
        {keysList.length > 1 && (
          <div className="mt-4 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Select key to inspect:
            </span>
            <div className="flex gap-1.5">
              {keysList.map((k, idx) => (
                <button
                  key={k}
                  onClick={() => setSelectedKeyIndex(idx)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                    idx === selectedKeyIndex
                      ? "bg-blue-600 text-white shadow-xs scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {k === " " ? "Space" : k.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Central Key Highlight Card */}
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-6 text-center dark:border-slate-800 dark:from-slate-900/60 dark:to-[#0B1220] shadow-sm">
          {/* 3D-styled Keycap */}
          <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-b-4 border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 transition-transform transform hover:scale-105">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {activeKey === " " ? "␣ Space" : activeKey.toUpperCase()}
            </span>
          </div>

          {/* Finger Badge & Hand Direction */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${colorData.bg} ${colorData.text} ${colorData.border} ${colorData.darkBg}`}
            >
              <Hand className="h-3.5 w-3.5" />
              {fingerInfo.name}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {fingerInfo.hand === "left"
                ? "Left Hand"
                : fingerInfo.hand === "right"
                ? "Right Hand"
                : "Either Thumb"}
            </span>
          </div>

          {/* Exact Step-by-Step Reach Guide */}
          <div className="mt-4 rounded-xl bg-white p-4 text-left border border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              How to Strike '{activeKey === " " ? "Space" : activeKey.toUpperCase()}':
            </div>

            <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 font-mono text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 mt-0.5">
                  1
                </span>
                <span>
                  Keep your hand anchored on the home row base (
                  <strong>
                    {fingerInfo.hand === "left" ? "ASDF" : fingerInfo.hand === "right" ? "JKL;" : "Home Row"}
                  </strong>
                  ).
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 font-mono text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 mt-0.5">
                  2
                </span>
                <span>
                  {activeKey === "f" || activeKey === "j" ? (
                    <span>
                      Locate the <strong>tactile raised bump</strong> on key {activeKey.toUpperCase()} without looking down.
                    </span>
                  ) : activeKey === " " ? (
                    <span>Tap the spacebar smoothly with your right or left thumb.</span>
                  ) : (
                    <span>
                      Move only your <strong>{fingerInfo.name}</strong> to strike '{activeKey}'. Keep other fingers resting lightly.
                    </span>
                  )}
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 font-mono text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 mt-0.5">
                  3
                </span>
                <span>
                  Immediately return your finger to its home row resting key. Never float in the air.
                </span>
              </li>
            </ol>
          </div>

          {/* Interactive "Try it now" test indicator */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-100/80 px-4 py-2.5 text-xs dark:bg-slate-800/60">
            <span className="text-slate-600 dark:text-slate-400">
              Press <kbd className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white">{activeKey === " " ? "Space" : activeKey.toUpperCase()}</kbd> on your keyboard:
            </span>

            {testedKeys.has(activeKey) ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-200">
                <CheckCircle2 className="h-4 w-4" /> Perfect!
              </span>
            ) : (
              <span className="text-slate-400 font-mono text-[11px] animate-pulse">
                Waiting for tap...
              </span>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Press <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">Enter</kbd> to begin
          </span>

          <button
            onClick={onClose}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            Start Practice Drill <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
