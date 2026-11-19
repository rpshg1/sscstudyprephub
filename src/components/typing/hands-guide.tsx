"use client";

import { FingerType } from "@/lib/typing/types";
import { FINGER_COLOR_MAP } from "@/lib/typing/finger-mapping";

interface HandsGuideProps {
  activeFinger: FingerType;
  currentKey: string;
  className?: string;
}

export function HandsGuide({
  activeFinger,
  currentKey,
  className = "",
}: HandsGuideProps) {
  const fingerData = FINGER_COLOR_MAP[activeFinger] || FINGER_COLOR_MAP["left-index"];

  // Helper to determine if a specific finger is active
  const is = (f: FingerType) => activeFinger === f;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all dark:border-slate-800 dark:bg-[#0F172A] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hand Placement & Finger Guide
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Next Finger:</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${fingerData.bg} ${fingerData.text} ${fingerData.border} ${fingerData.darkBg}`}
          >
            {fingerData.label}
          </span>
          <span className="inline-flex items-center justify-center rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white shadow-xs dark:bg-white dark:text-slate-900">
            {currentKey === " " ? "Space" : currentKey}
          </span>
        </div>
      </div>

      {/* SVG Hands Diagram */}
      <div className="mt-3 flex items-center justify-center">
        <svg
          viewBox="0 0 680 200"
          className="h-32 w-auto max-w-full drop-shadow-xs sm:h-36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* LEFT HAND PALM */}
          <g id="left-hand">
            {/* Palm base */}
            <path
              d="M 140 185 C 140 140 160 120 180 115 C 220 115 250 140 250 185 Z"
              className="fill-slate-100 stroke-slate-300 dark:fill-slate-800/80 dark:stroke-slate-700"
              strokeWidth="2"
            />
            {/* Left Pinky */}
            <rect
              x="130"
              y={is("left-pinky") ? "48" : "55"}
              width="22"
              height="65"
              rx="11"
              className={`transition-all duration-150 ${
                is("left-pinky")
                  ? "fill-purple-500 stroke-purple-600 stroke-2 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="141" y="88" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none">
              A
            </text>

            {/* Left Ring */}
            <rect
              x="158"
              y={is("left-ring") ? "28" : "35"}
              width="23"
              height="85"
              rx="11"
              className={`transition-all duration-150 ${
                is("left-ring")
                  ? "fill-blue-500 stroke-blue-600 stroke-2 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="169" y="78" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none">
              S
            </text>

            {/* Left Middle */}
            <rect
              x="187"
              y={is("left-middle") ? "18" : "25"}
              width="24"
              height="95"
              rx="12"
              className={`transition-all duration-150 ${
                is("left-middle")
                  ? "fill-emerald-500 stroke-emerald-600 stroke-2 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="199" y="72" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none">
              D
            </text>

            {/* Left Index */}
            <rect
              x="217"
              y={is("left-index") ? "28" : "35"}
              width="24"
              height="85"
              rx="12"
              className={`transition-all duration-150 ${
                is("left-index")
                  ? "fill-amber-400 stroke-amber-500 stroke-2 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="229" y="78" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none">
              F •
            </text>

            {/* Left Thumb */}
            <path
              d="M 245 140 C 265 130 280 120 290 135 C 295 145 285 160 260 170 Z"
              className={`transition-all duration-150 ${
                is("thumb")
                  ? "fill-slate-700 stroke-slate-900 stroke-2 dark:fill-slate-300"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="195" y="165" textAnchor="middle" className="text-[11px] font-bold fill-slate-400 dark:fill-slate-400">
              Left Hand (ASDF)
            </text>
          </g>

          {/* SPACEBAR DIVIDER */}
          <g id="spacebar-center">
            <rect
              x="305"
              y="140"
              width="70"
              height="28"
              rx="6"
              className={`transition-all ${
                is("thumb")
                  ? "fill-blue-500 stroke-blue-600 stroke-2 shadow-md"
                  : "fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
              }`}
            />
            <text
              x="340"
              y="158"
              textAnchor="middle"
              className={`text-[11px] font-bold ${
                is("thumb") ? "fill-white" : "fill-slate-500 dark:fill-slate-400"
              }`}
            >
              SPACE
            </text>
          </g>

          {/* RIGHT HAND PALM */}
          <g id="right-hand">
            {/* Palm base */}
            <path
              d="M 430 185 C 430 140 460 115 500 115 C 520 120 540 140 540 185 Z"
              className="fill-slate-100 stroke-slate-300 dark:fill-slate-800/80 dark:stroke-slate-700"
              strokeWidth="2"
            />

            {/* Right Thumb */}
            <path
              d="M 435 140 C 415 130 400 120 390 135 C 385 145 395 160 420 170 Z"
              className={`transition-all duration-150 ${
                is("thumb")
                  ? "fill-slate-700 stroke-slate-900 stroke-2 dark:fill-slate-300"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />

            {/* Right Index */}
            <rect
              x="439"
              y={is("right-index") ? "28" : "35"}
              width="24"
              height="85"
              rx="12"
              className={`transition-all duration-150 ${
                is("right-index")
                  ? "fill-orange-500 stroke-orange-600 stroke-2 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="451" y="78" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none">
              • J
            </text>

            {/* Right Middle */}
            <rect
              x="469"
              y={is("right-middle") ? "18" : "25"}
              width="24"
              height="95"
              rx="12"
              className={`transition-all duration-150 ${
                is("right-middle")
                  ? "fill-teal-500 stroke-teal-600 stroke-2 filter drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="481" y="72" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none">
              K
            </text>

            {/* Right Ring */}
            <rect
              x="499"
              y={is("right-ring") ? "28" : "35"}
              width="23"
              height="85"
              rx="11"
              className={`transition-all duration-150 ${
                is("right-ring")
                  ? "fill-indigo-500 stroke-indigo-600 stroke-2 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="510" y="78" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none">
              L
            </text>

            {/* Right Pinky */}
            <rect
              x="528"
              y={is("right-pinky") ? "48" : "55"}
              width="22"
              height="65"
              rx="11"
              className={`transition-all duration-150 ${
                is("right-pinky")
                  ? "fill-rose-500 stroke-rose-600 stroke-2 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                  : "fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600"
              }`}
            />
            <text x="539" y="88" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none">
              ;
            </text>

            <text x="485" y="165" textAnchor="middle" className="text-[11px] font-bold fill-slate-400 dark:fill-slate-400">
              Right Hand (JKL;)
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Left F bump
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" /> Right J bump
        </span>
        <span className="text-slate-400 dark:text-slate-500">• Hands float, wrists relaxed</span>
      </div>
    </div>
  );
}
