"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Volume2,
  VolumeX,
} from "lucide-react";
import { typingAudio } from "@/lib/typing/audio";

interface ExamPassageConfig {
  id: string;
  name: "SSC CGL DEST" | "SSC CHSL DEST";
  timeMinutes: number;
  expectedKeystrokes: number;
  cutoffUR: number; // 5%
  cutoffReserved: number; // 7%
  text: string;
}

const DEFAULT_EXAM_PASSAGES: ExamPassageConfig[] = [
  {
    id: "cgl-1",
    name: "SSC CGL DEST",
    timeMinutes: 15,
    expectedKeystrokes: 2000,
    cutoffUR: 5,
    cutoffReserved: 7,
    text: "The Staff Selection Commission conducts the Combined Graduate Level Examination annually to recruit qualified personnel for various administrative, executive, and clerical posts across central government ministries and attached offices. Candidate evaluation entails a multi-tier testing framework comprising computer based examinations, quantitative reasoning assessments, English comprehension, and destination skill tests. In recent years, digital governance initiatives have enhanced recruitment transparency, enabling rapid candidate verification, automated test center allocation, and seamless publication of merit lists. Modern public administration requires officials to possess high clerical dexterity, digital fluency, and meticulous attention to statutory guidelines. Candidates appointed to secretarial and departmental postings frequently handle official correspondence, draft administrative memoranda, process citizen grievances, and maintain digital archives. Therefore, the Data Entry Skill Test is mandatory to ensure every appointee meets minimum typing standards. Touch typing proficiency with floating wrists and disciplined keying ensures endurance and reduces fatigue during demanding administrative tasks. Sound preparation demands consistent daily typing routines focusing on accuracy over raw speed, because uncorrected typographical errors directly inflate the commission penalty percentage, risking disqualification.",
  },
  {
    id: "chsl-1",
    name: "SSC CHSL DEST",
    timeMinutes: 10,
    expectedKeystrokes: 1750,
    cutoffUR: 7,
    cutoffReserved: 10,
    text: "Democracy in modern India is sustained through constitutional institutions committed to democratic accountability, rule of law, and socio-economic empowerment. The Parliament of India enacts federal legislation addressing public finance, judicial administration, national security, and welfare entitlements. Across state capitals and central territories, public service personnel translate legislative mandates into tangible community benefits through decentralized welfare programs and public distribution networks. Effective administrative functioning depends on accurate record keeping, prompt dispatch of official orders, and timely communication between district collectors and state secretariats. The Data Entry Skill Test conducted for Combined Higher Secondary Level positions validates that aspirants can transcribe documents swiftly without omitting vital statistical clauses or confusing administrative terminology. Aspirants are advised to read through passages systematically, maintain an uninterrupted typing cadence, and refrain from reckless backspacing during the examination.",
  },
];

export function DestExamRunner() {
  const [selectedExamId, setSelectedExamId] = useState<string>("cgl-1");
  const exam = useMemo(
    () => DEFAULT_EXAM_PASSAGES.find((p) => p.id === selectedExamId) || DEFAULT_EXAM_PASSAGES[0],
    [selectedExamId]
  );

  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.timeMinutes * 60);
  const [typedText, setTypedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch exams
  const handleSelectExam = (id: string) => {
    setSelectedExamId(id);
    const chosen = DEFAULT_EXAM_PASSAGES.find((p) => p.id === id) || DEFAULT_EXAM_PASSAGES[0];
    setTypedText("");
    setHasStarted(false);
    setIsFinished(false);
    setTimeLeftSeconds(chosen.timeMinutes * 60);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Reset exam
  const handleReset = useCallback(() => {
    setTypedText("");
    setHasStarted(false);
    setIsFinished(false);
    setTimeLeftSeconds(exam.timeMinutes * 60);
    if (timerRef.current) clearInterval(timerRef.current);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, [exam]);

  // Finish exam
  const handleFinish = useCallback(() => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    typingAudio.playSuccessChime();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (hasStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, isFinished, handleFinish]);

  // Input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    const val = e.target.value;
    setTypedText(val);

    if (val.length > typedText.length) {
      typingAudio.playKeyClick();
    }

    if (val.length >= exam.text.length) {
      handleFinish();
    }
  };

  // Calculate SSC commission error metrics
  const evaluation = useMemo(() => {
    const originalWords = exam.text.trim().split(/\s+/);
    const typedWords = typedText.trim().split(/\s+/);

    let fullMistakes = 0;
    let halfMistakes = 0;

    const totalWordsEvaluated = Math.max(originalWords.length, 1);

    typedWords.forEach((word, idx) => {
      const origWord = originalWords[idx];
      if (!origWord) {
        // Extra added word -> full mistake
        fullMistakes += 1;
      } else if (word === origWord) {
        // Correct
      } else if (word.toLowerCase() === origWord.toLowerCase()) {
        // Case error -> half mistake
        halfMistakes += 1;
      } else {
        // Difference length or typo
        if (Math.abs(word.length - origWord.length) > 3) {
          fullMistakes += 1; // Substituted completely
        } else {
          halfMistakes += 1; // Minor spelling typo
        }
      }
    });

    // Un-typed words are counted as omissions
    if (typedWords.length < originalWords.length && hasStarted) {
      const omitted = originalWords.length - typedWords.length;
      fullMistakes += omitted;
    }

    const totalPenaltyPoints = fullMistakes + halfMistakes * 0.5;
    const errorPercentage = Math.min(
      100,
      parseFloat(((totalPenaltyPoints / totalWordsEvaluated) * 100).toFixed(2))
    );

    const elapsedSeconds = exam.timeMinutes * 60 - timeLeftSeconds;
    const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.1);
    const grossWpm = Math.round(typedText.length / 5 / elapsedMinutes);
    const netWpm = Math.max(0, Math.round((typedText.length / 5 - totalPenaltyPoints * 5) / elapsedMinutes));

    const isQualifiedUR = errorPercentage <= exam.cutoffUR && typedText.length >= exam.expectedKeystrokes * 0.8;
    const isQualifiedReserved = errorPercentage <= exam.cutoffReserved && typedText.length >= exam.expectedKeystrokes * 0.75;

    return {
      totalKeystrokes: typedText.length,
      fullMistakes,
      halfMistakes,
      totalPenaltyPoints,
      errorPercentage,
      grossWpm,
      netWpm,
      isQualifiedUR,
      isQualifiedReserved,
    };
  }, [exam, typedText, timeLeftSeconds, hasStarted]);

  return (
    <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/typing"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Curriculum
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
              Official Commission Test Simulator
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            SSC CGL & CHSL DEST Exam Simulator
          </h1>
        </div>

        {/* Exam Type Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectExam("cgl-1")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedExamId === "cgl-1"
                ? "bg-blue-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            SSC CGL (15 Min / 2000 Strokes)
          </button>
          <button
            onClick={() => handleSelectExam("chsl-1")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedExamId === "chsl-1"
                ? "bg-blue-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            SSC CHSL (10 Min / 1750 Strokes)
          </button>
        </div>
      </div>

      {/* Timer & Live Status Bar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-600" /> Time Remaining
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
            {Math.floor(timeLeftSeconds / 60)}:
            {(timeLeftSeconds % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Keystrokes Typed
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {typedText.length}
            </span>
            <span className="text-xs text-slate-400">/ {exam.expectedKeystrokes} required</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Estimated Error %
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-2xl font-extrabold ${
                evaluation.errorPercentage <= exam.cutoffUR
                  ? "text-emerald-600"
                  : evaluation.errorPercentage <= exam.cutoffReserved
                  ? "text-amber-500"
                  : "text-red-500"
              }`}
            >
              {evaluation.errorPercentage}%
            </span>
            <span className="text-xs text-slate-400">
              (&lt;= {exam.cutoffUR}% UR limit)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Test Controls
          </span>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restart
            </button>
            {hasStarted && !isFinished && (
              <button
                onClick={handleFinish}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
              >
                Submit Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two-Pane Official Examination Screen */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Official Reference Passage */}
        <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" /> Master Passage (Commission Copy)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {exam.text.split(" ").length} words
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 select-none p-2 bg-white rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            {exam.text}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Transcribe the master passage verbatim in the right pane without skipping punctuation or capitalization.
          </p>
        </div>

        {/* Right Pane: Candidate Typing Input */}
        <div className="rounded-2xl border-2 border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/50 dark:bg-[#0B1220] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Candidate Transcription Box
            </span>
            <span className="text-[11px] text-slate-400">
              {hasStarted ? "Exam in Progress" : "Start typing to begin timer"}
            </span>
          </div>

          <textarea
            ref={inputRef}
            disabled={isFinished}
            value={typedText}
            onChange={handleTextChange}
            placeholder="Click here and begin typing to start the official exam timer..."
            className="flex-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 font-mono text-sm leading-relaxed text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 min-h-[340px]"
          />

          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Strokes: {typedText.length}</span>
            <span>Words: {typedText.trim() ? typedText.trim().split(/\s+/).length : 0}</span>
          </div>
        </div>
      </div>

      {/* Post-Exam Commission Evaluation Report */}
      {isFinished && (
        <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#0F172A] animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  evaluation.isQualifiedUR
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                }`}
              >
                {evaluation.isQualifiedUR ? (
                  <CheckCircle2 className="h-7 w-7" />
                ) : (
                  <XCircle className="h-7 w-7" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Official DEST Scorecard & Result
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated using Staff Selection Commission formula and evaluation standards
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                  evaluation.isQualifiedUR
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : evaluation.isQualifiedReserved
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {evaluation.isQualifiedUR
                  ? "QUALIFIED (UR & All Categories)"
                  : evaluation.isQualifiedReserved
                  ? "QUALIFIED (Reserved Categories Only)"
                  : "NOT QUALIFIED"}
              </span>
            </div>
          </div>

          {/* Detailed Metric Cards */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Gross Speed</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {evaluation.grossWpm} WPM
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Net Speed</span>
              <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                {evaluation.netWpm} WPM
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Full Mistakes (1 pt)
              </span>
              <p className="text-xl font-extrabold text-red-600 dark:text-red-400 mt-0.5">
                {evaluation.fullMistakes}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Half Mistakes (0.5 pt)
              </span>
              <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400 mt-0.5">
                {evaluation.halfMistakes}
              </p>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="mt-4 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
              Commission Cutoff Summary:
            </p>
            <p>
              • <strong>Unreserved (UR):</strong> Maximum permissible error is <strong>5.0%</strong>. Your score: <strong>{evaluation.errorPercentage}%</strong> ({evaluation.isQualifiedUR ? "PASSED" : "FAILED"}).
            </p>
            <p className="mt-1">
              • <strong>OBC / EWS / SC / ST / PwD:</strong> Maximum permissible error is <strong>7.0%</strong>. Your score: <strong>{evaluation.errorPercentage}%</strong> ({evaluation.isQualifiedReserved ? "PASSED" : "FAILED"}).
            </p>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Take Another Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
