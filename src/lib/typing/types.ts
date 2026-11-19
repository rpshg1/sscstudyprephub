export type FingerType =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky"
  | "thumb";

export interface HandPlacement {
  leftHandRest: string; // e.g. "A S D F"
  rightHandRest: string; // e.g. "J K L ;"
  activeFinger: FingerType;
  fingerDescription: string; // e.g. "Left Index Finger strikes F"
}

export interface TypingChapter {
  id: number;
  stageId: number;
  stageTitle: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  description: string;
  instructions: string[];
  newKeys: string[];
  allKeys: string[];
  drillText: string;
  targetWpm: number;
  minAccuracy: number;
  tutorialTip: string;
  handGuide: HandPlacement;
  hasVideoTutorial?: boolean;
  videoUrl?: string;
  examType?: "PRACTICE" | "CGL_DEST" | "CHSL_DEST";
}

export interface TypingStage {
  id: number;
  title: string;
  subtitle: string;
  chapterRange: string;
  startChapter: number;
  endChapter: number;
  totalChapters: number;
  description: string;
  badge: string;
  color: string;
  targetWpmRange: string;
}

export interface ChapterProgress {
  chapterId: number;
  completed: boolean;
  stars: number; // 0 to 3
  bestWpm: number;
  bestAccuracy: number;
  completedAt: string;
}

export interface UserTypingState {
  completedChapters: Record<number, ChapterProgress>;
  currentChapterId: number;
  totalKeystrokes: number;
  soundEnabled: boolean;
  theme: "classic" | "exam" | "high-contrast";
}

export interface DestExamResult {
  examName: "SSC CGL DEST" | "SSC CHSL DEST";
  timeAllowedSeconds: number;
  timeTakenSeconds: number;
  totalWordsProvided: number;
  totalWordsTyped: number;
  totalKeystrokes: number;
  grossWpm: number;
  netWpm: number;
  fullMistakes: number;
  halfMistakes: number;
  totalMistakes: number;
  errorPercentage: number;
  cutoffLimitUR: number; // 5% for UR
  cutoffLimitReserved: number; // 7% for OBC/SC/ST
  qualifyingStatusUR: boolean;
  qualifyingStatusReserved: boolean;
}
