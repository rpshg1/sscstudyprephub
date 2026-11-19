"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, Lightbulb, Sparkles, X, Eye, ShieldCheck } from "lucide-react";

interface PostureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostureModal({ isOpen, onClose }: PostureModalProps) {
  const [activeTab, setActiveTab] = useState<"posture" | "placement" | "ssc-tips">("placement");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#0F172A] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Touch Typing Masterclass & Ergonomics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official guide for SSC CGL / CHSL DEST & daily professional typing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5 pt-3 dark:border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab("placement")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "placement"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            1. Hand Placement (Home Row)
          </button>
          <button
            onClick={() => setActiveTab("posture")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "posture"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            2. Sitting Posture & Wrists
          </button>
          <button
            onClick={() => setActiveTab("ssc-tips")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "ssc-tips"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            3. SSC DEST Exam Strategy
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "placement" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                      The Golden Rule: Never Peek at the Keyboard
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                      Your eyes must stay glued to the screen. If you make a mistake, don't look down! Feel the bumps on <strong>F</strong> and <strong>J</strong> to re-align your fingers blindly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300 mb-2">
                    Left Hand (A-S-D-F)
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-purple-600 dark:text-purple-400">Pinky:</span> Key <strong>A</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">Ring:</span> Key <strong>S</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Middle:</span> Key <strong>D</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-amber-600 dark:text-amber-400">Index:</span> Key <strong>F</strong> (Find the tactile bump!)
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <span className="inline-block rounded-md bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300 mb-2">
                    Right Hand (J-K-L-;)
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-orange-600 dark:text-orange-400">Index:</span> Key <strong>J</strong> (Find the tactile bump!)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-teal-600 dark:text-teal-400">Middle:</span> Key <strong>K</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Ring:</span> Key <strong>L</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-rose-600 dark:text-rose-400">Pinky:</span> Key <strong>; (Semicolon)</strong>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300 flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-white">Thumbs:</span>
                <span>Both thumbs hover lightly above the <strong>Spacebar</strong>. Use whichever thumb feels most natural (typically the right thumb).</span>
              </div>
            </div>
          )}

          {activeTab === "posture" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-2xl font-bold text-blue-600 mb-1">90°</div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Elbow Angle</h5>
                  <p className="text-[11px] text-slate-500 mt-1">Keep elbows bent at approximately 90 degrees close to your torso.</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">Flat</div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Feet on Floor</h5>
                  <p className="text-[11px] text-slate-500 mt-1">Both feet firmly planted flat on the floor to stabilize your spine.</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-2xl font-bold text-purple-600 mb-1">Float</div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Floating Wrists</h5>
                  <p className="text-[11px] text-slate-500 mt-1">Do not rest wrists on the desk while typing; hover like a pianist.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Monitor at eye level:</strong> Top of the screen should align with your eye line to prevent neck strain during 15-minute SSC DEST exams.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Relaxed shoulders:</strong> Avoid hunching forward; keep shoulder blades down and back straight.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Light key taps:</strong> Do not slam keys. Modern mechanical and membrane keyboards register keystrokes with gentle pressure.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ssc-tips" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Official SSC CGL & CHSL DEST Grading Rules
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                  The Staff Selection Commission evaluates typing speed on <strong>2000 key depressions in 15 minutes</strong> (~27-35 WPM). Qualifying requires error percentage strictly under <strong>5% (UR)</strong> or <strong>7% (Reserved categories)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-red-200 bg-red-50/30 p-3.5 dark:border-red-950 dark:bg-red-950/20">
                  <h5 className="font-bold text-red-700 dark:text-red-400 mb-1.5">Full Mistakes (1 Penalty Point)</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    <li>Omission of any word or figure</li>
                    <li>Substitution of a wrong word</li>
                    <li>Addition of every word not in the passage</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-3.5 dark:border-orange-950 dark:bg-orange-950/20">
                  <h5 className="font-bold text-orange-700 dark:text-orange-400 mb-1.5">Half Mistakes (0.5 Penalty Point)</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    <li>Spelling error in a word</li>
                    <li>Capitalization error (e.g., lower instead of upper)</li>
                    <li>Punctuation mark omission or error</li>
                    <li>Transposition of letters (e.g., 'teh' for 'the')</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300 space-y-2">
                <p><strong>Pro Exam Tip:</strong> Never hit backspace frantically. Each backspace wastes 0.5 to 1 second. Maintaining a steady 35 WPM rhythm with 98% accuracy beats rushing at 50 WPM with errors.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono text-[10px]">Esc</kbd> anytime to restart a chapter
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Got it, Let's Practice!
          </button>
        </div>
      </div>
    </div>
  );
}
