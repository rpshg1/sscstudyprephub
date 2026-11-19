import { ChapterProgress, UserTypingState } from "./types";

const STORAGE_KEY = "ssph-typing-progress-v1";

const DEFAULT_STATE: UserTypingState = {
  completedChapters: {},
  currentChapterId: 1,
  totalKeystrokes: 0,
  soundEnabled: true,
  theme: "classic",
};

export function loadUserTypingState(): UserTypingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as UserTypingState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      completedChapters: parsed.completedChapters || {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveUserTypingState(state: UserTypingState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota or private mode
  }
}

export function saveChapterProgress(
  chapterId: number,
  wpm: number,
  accuracy: number,
  stars: number
): UserTypingState {
  const current = loadUserTypingState();
  const existing = current.completedChapters[chapterId];

  const updatedProgress: ChapterProgress = {
    chapterId,
    completed: true,
    stars: Math.max(stars, existing?.stars || 0),
    bestWpm: Math.max(wpm, existing?.bestWpm || 0),
    bestAccuracy: Math.max(accuracy, existing?.bestAccuracy || 0),
    completedAt: new Date().toISOString(),
  };

  const nextChapterId = Math.max(current.currentChapterId, chapterId + 1);

  const newState: UserTypingState = {
    ...current,
    currentChapterId: Math.min(nextChapterId, 365),
    completedChapters: {
      ...current.completedChapters,
      [chapterId]: updatedProgress,
    },
    totalKeystrokes: (current.totalKeystrokes || 0) + Math.round(wpm * 5),
  };

  saveUserTypingState(newState);
  return newState;
}

export function calculateStars(
  wpm: number,
  accuracy: number,
  targetWpm: number,
  minAccuracy: number
): number {
  if (accuracy < minAccuracy) return 0;
  if (wpm >= targetWpm + 5 && accuracy >= 98) return 3;
  if (wpm >= targetWpm && accuracy >= minAccuracy) return 2;
  if (wpm >= Math.max(10, targetWpm - 5) && accuracy >= minAccuracy) return 1;
  return 1;
}
