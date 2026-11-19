"use client";

import { useMemo } from "react";
import { getKeyFingerInfo, FINGER_COLOR_MAP } from "@/lib/typing/finger-mapping";

interface VirtualKeyboardProps {
  currentKey: string;
  pressedKey?: string | null;
  className?: string;
}

interface KeyConfig {
  key: string;
  display: string;
  width?: string;
  fingerClass?: string;
  isSpecial?: boolean;
  hasBump?: boolean;
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 1
  [
    { key: "`", display: "~ `", width: "w-10 sm:w-11" },
    { key: "1", display: "! 1", width: "w-10 sm:w-11" },
    { key: "2", display: "@ 2", width: "w-10 sm:w-11" },
    { key: "3", display: "# 3", width: "w-10 sm:w-11" },
    { key: "4", display: "$ 4", width: "w-10 sm:w-11" },
    { key: "5", display: "% 5", width: "w-10 sm:w-11" },
    { key: "6", display: "^ 6", width: "w-10 sm:w-11" },
    { key: "7", display: "& 7", width: "w-10 sm:w-11" },
    { key: "8", display: "* 8", width: "w-10 sm:w-11" },
    { key: "9", display: "( 9", width: "w-10 sm:w-11" },
    { key: "0", display: ") 0", width: "w-10 sm:w-11" },
    { key: "-", display: "_ -", width: "w-10 sm:w-11" },
    { key: "=", display: "+ =", width: "w-10 sm:w-11" },
    { key: "Backspace", display: "⌫ Backspace", width: "flex-1 min-w-[70px]", isSpecial: true },
  ],
  // Row 2
  [
    { key: "Tab", display: "Tab", width: "w-14 sm:w-16", isSpecial: true },
    { key: "q", display: "Q", width: "w-10 sm:w-11" },
    { key: "w", display: "W", width: "w-10 sm:w-11" },
    { key: "e", display: "E", width: "w-10 sm:w-11" },
    { key: "r", display: "R", width: "w-10 sm:w-11" },
    { key: "t", display: "T", width: "w-10 sm:w-11" },
    { key: "y", display: "Y", width: "w-10 sm:w-11" },
    { key: "u", display: "U", width: "w-10 sm:w-11" },
    { key: "i", display: "I", width: "w-10 sm:w-11" },
    { key: "o", display: "O", width: "w-10 sm:w-11" },
    { key: "p", display: "P", width: "w-10 sm:w-11" },
    { key: "[", display: "{ [", width: "w-10 sm:w-11" },
    { key: "]", display: "} ]", width: "w-10 sm:w-11" },
    { key: "\\", display: "| \\", width: "w-12 sm:w-14", isSpecial: true },
  ],
  // Row 3 (Home Row)
  [
    { key: "CapsLock", display: "Caps Lock", width: "w-16 sm:w-20", isSpecial: true },
    { key: "a", display: "A", width: "w-10 sm:w-11" },
    { key: "s", display: "S", width: "w-10 sm:w-11" },
    { key: "d", display: "D", width: "w-10 sm:w-11" },
    { key: "f", display: "F", width: "w-10 sm:w-11", hasBump: true },
    { key: "g", display: "G", width: "w-10 sm:w-11" },
    { key: "h", display: "H", width: "w-10 sm:w-11" },
    { key: "j", display: "J", width: "w-10 sm:w-11", hasBump: true },
    { key: "k", display: "K", width: "w-10 sm:w-11" },
    { key: "l", display: "L", width: "w-10 sm:w-11" },
    { key: ";", display: ": ;", width: "w-10 sm:w-11" },
    { key: "'", display: "\" '", width: "w-10 sm:w-11" },
    { key: "Enter", display: "↵ Enter", width: "flex-1 min-w-[75px]", isSpecial: true },
  ],
  // Row 4
  [
    { key: "ShiftLeft", display: "⇧ Shift", width: "w-20 sm:w-24", isSpecial: true },
    { key: "z", display: "Z", width: "w-10 sm:w-11" },
    { key: "x", display: "X", width: "w-10 sm:w-11" },
    { key: "c", display: "C", width: "w-10 sm:w-11" },
    { key: "v", display: "V", width: "w-10 sm:w-11" },
    { key: "b", display: "B", width: "w-10 sm:w-11" },
    { key: "n", display: "N", width: "w-10 sm:w-11" },
    { key: "m", display: "M", width: "w-10 sm:w-11" },
    { key: ",", display: "< ,", width: "w-10 sm:w-11" },
    { key: ".", display: "> .", width: "w-10 sm:w-11" },
    { key: "/", display: "? /", width: "w-10 sm:w-11" },
    { key: "ShiftRight", display: "⇧ Shift", width: "flex-1 min-w-[85px]", isSpecial: true },
  ],
  // Row 5
  [
    { key: "ControlLeft", display: "Ctrl", width: "w-12 sm:w-14", isSpecial: true },
    { key: "AltLeft", display: "Alt", width: "w-12 sm:w-14", isSpecial: true },
    { key: " ", display: "Space", width: "flex-1 min-w-[220px] max-w-[420px]" },
    { key: "AltRight", display: "Alt", width: "w-12 sm:w-14", isSpecial: true },
    { key: "ControlRight", display: "Ctrl", width: "w-12 sm:w-14", isSpecial: true },
  ],
];

export function VirtualKeyboard({
  currentKey,
  pressedKey,
  className = "",
}: VirtualKeyboardProps) {
  // Normalize current key for matching
  const normalizedTarget = useMemo(() => {
    if (!currentKey) return "";
    if (currentKey === " ") return " ";
    return currentKey;
  }, [currentKey]);

  const activeFingerInfo = useMemo(() => {
    return getKeyFingerInfo(normalizedTarget);
  }, [normalizedTarget]);

  const isShiftRequired = useMemo(() => {
    return (
      (normalizedTarget.length === 1 &&
        normalizedTarget >= "A" &&
        normalizedTarget <= "Z") ||
      '~!@#$%^&*()_+{}|:"<>?'.includes(normalizedTarget)
    );
  }, [normalizedTarget]);

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-900/95 p-3.5 sm:p-5 text-white shadow-xl dark:border-slate-800 dark:bg-[#070D18] ${className}`}
    >
      {/* Keyboard Header Legend */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Virtual QWERTY Guide</span>
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-400">
            Standard US 104-Key
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 text-purple-400">
            <span className="h-2 w-2 rounded-full bg-purple-500" /> Pinky
          </span>
          <span className="inline-flex items-center gap-1 text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Ring
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Middle
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Index
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> Thumb
          </span>
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1.5 select-none overflow-x-auto pb-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex items-center justify-center gap-1 sm:gap-1.5 min-w-[620px]">
            {row.map((k) => {
              const isSpace = k.key === " ";
              const isShiftLeft = k.key === "ShiftLeft";
              const isShiftRight = k.key === "ShiftRight";

              // Check if this key matches target
              let isTarget = false;
              if (isSpace && normalizedTarget === " ") {
                isTarget = true;
              } else if (
                !k.isSpecial &&
                k.key.toLowerCase() === normalizedTarget.toLowerCase()
              ) {
                isTarget = true;
              } else if (
                isShiftRequired &&
                activeFingerInfo.hand === "right" &&
                isShiftLeft
              ) {
                isTarget = true; // Use Left Shift for Right hand keys
              } else if (
                isShiftRequired &&
                activeFingerInfo.hand === "left" &&
                isShiftRight
              ) {
                isTarget = true; // Use Right Shift for Left hand keys
              }

              // Color accents
              const fInfo = !k.isSpecial ? getKeyFingerInfo(k.key) : null;
              const fingerColor = fInfo ? FINGER_COLOR_MAP[fInfo.finger] : null;

              return (
                <div
                  key={k.key}
                  className={`relative flex h-10 sm:h-12 items-center justify-center rounded-lg border text-xs sm:text-sm font-semibold transition-all duration-100 ${
                    k.width || "w-10 sm:w-11"
                  } ${
                    isTarget
                      ? "border-emerald-400 bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-105 z-10 font-bold"
                      : k.isSpecial
                      ? "border-slate-800 bg-slate-800/80 text-slate-400 text-[11px]"
                      : "border-slate-800/90 bg-slate-800/50 text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <span>{k.display}</span>

                  {/* Tactile bumps for F and J */}
                  {k.hasBump && (
                    <span
                      className={`absolute bottom-1.5 h-1 w-3.5 rounded-full ${
                        isTarget ? "bg-slate-900" : "bg-amber-400"
                      }`}
                    />
                  )}

                  {/* Finger color badge dot */}
                  {!k.isSpecial && !isTarget && fingerColor && (
                    <span
                      className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full opacity-60 ${
                        fInfo?.finger === "left-pinky" || fInfo?.finger === "right-pinky"
                          ? "bg-purple-400"
                          : fInfo?.finger === "left-ring" || fInfo?.finger === "right-ring"
                          ? "bg-blue-400"
                          : fInfo?.finger === "left-middle" || fInfo?.finger === "right-middle"
                          ? "bg-emerald-400"
                          : fInfo?.finger === "thumb"
                          ? "bg-slate-400"
                          : "bg-amber-400"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
