import { FingerType } from "./types";

export interface KeyFingerInfo {
  key: string;
  finger: FingerType;
  hand: "left" | "right" | "thumb";
  name: string;
  colorClass: string;
  darkColorClass: string;
}

export const FINGER_COLOR_MAP: Record<
  FingerType,
  { label: string; bg: string; text: string; border: string; darkBg: string }
> = {
  "left-pinky": {
    label: "Left Pinky",
    bg: "bg-purple-100",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-800",
    darkBg: "dark:bg-purple-950/60",
  },
  "left-ring": {
    label: "Left Ring",
    bg: "bg-blue-100",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-800",
    darkBg: "dark:bg-blue-950/60",
  },
  "left-middle": {
    label: "Left Middle",
    bg: "bg-emerald-100",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-800",
    darkBg: "dark:bg-emerald-950/60",
  },
  "left-index": {
    label: "Left Index",
    bg: "bg-amber-100",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-800",
    darkBg: "dark:bg-amber-950/60",
  },
  "thumb": {
    label: "Thumb (Space)",
    bg: "bg-slate-100",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
    darkBg: "dark:bg-slate-800",
  },
  "right-index": {
    label: "Right Index",
    bg: "bg-orange-100",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-800",
    darkBg: "dark:bg-orange-950/60",
  },
  "right-middle": {
    label: "Right Middle",
    bg: "bg-teal-100",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-300 dark:border-teal-800",
    darkBg: "dark:bg-teal-950/60",
  },
  "right-ring": {
    label: "Right Ring",
    bg: "bg-indigo-100",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-800",
    darkBg: "dark:bg-indigo-950/60",
  },
  "right-pinky": {
    label: "Right Pinky",
    bg: "bg-rose-100",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-800",
    darkBg: "dark:bg-rose-950/60",
  },
};

const CHARACTER_MAP: Record<string, KeyFingerInfo> = {
  // Left Pinky
  "1": { key: "1", finger: "left-pinky", hand: "left", name: "Left Pinky", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "!": { key: "!", finger: "left-pinky", hand: "left", name: "Left Pinky", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "`": { key: "`", finger: "left-pinky", hand: "left", name: "Left Pinky", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "~": { key: "~", finger: "left-pinky", hand: "left", name: "Left Pinky", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "q": { key: "q", finger: "left-pinky", hand: "left", name: "Left Pinky", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "Q": { key: "Q", finger: "left-pinky", hand: "left", name: "Left Pinky (+ Right Shift)", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "a": { key: "a", finger: "left-pinky", hand: "left", name: "Left Pinky (Home)", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "A": { key: "A", finger: "left-pinky", hand: "left", name: "Left Pinky (Home + Right Shift)", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "z": { key: "z", finger: "left-pinky", hand: "left", name: "Left Pinky", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },
  "Z": { key: "Z", finger: "left-pinky", hand: "left", name: "Left Pinky (+ Right Shift)", colorClass: "text-purple-600", darkColorClass: "dark:text-purple-400" },

  // Left Ring
  "2": { key: "2", finger: "left-ring", hand: "left", name: "Left Ring", colorClass: "text-blue-600", darkColorClass: "dark:text-blue-400" },
  "@": { key: "@", finger: "left-ring", hand: "left", name: "Left Ring (+ Right Shift)", colorClass: "text-blue-600", darkColorClass: "dark:text-blue-400" },
  "w": { key: "w", finger: "left-ring", hand: "left", name: "Left Ring", colorClass: "text-blue-600", darkColorClass: "dark:text-blue-400" },
  "W": { key: "W", finger: "left-ring", hand: "left", name: "Left Ring (+ Right Shift)", colorClass: "text-blue-600", darkColorClass: "dark:text-blue-400" },
  "s": { key: "s", finger: "left-ring", hand: "left", name: "Left Ring (Home)", colorClass: "text-blue-600", darkColorClass: "dark:text-blue-400" },
  "S": { key: "S", finger: "left-ring", hand: "left", name: "Left Ring (Home + Right Shift)", colorClass: "text-blue-600", darkColorClass: "dark:text-blue-400" },
  "x": { key: "x", finger: "left-ring", hand: "left", name: "Left Ring", colorClass: "text-blue-600", darkColorClass: "dark:text-blue-400" },
  "X": { key: "X", finger: "left-ring", hand: "left", name: "Left Ring (+ Right Shift)", colorClass: "text-blue-600", darkColorClass: "dark:text-blue-400" },

  // Left Middle
  "3": { key: "3", finger: "left-middle", hand: "left", name: "Left Middle", colorClass: "text-emerald-600", darkColorClass: "dark:text-emerald-400" },
  "#": { key: "#", finger: "left-middle", hand: "left", name: "Left Middle (+ Right Shift)", colorClass: "text-emerald-600", darkColorClass: "dark:text-emerald-400" },
  "e": { key: "e", finger: "left-middle", hand: "left", name: "Left Middle", colorClass: "text-emerald-600", darkColorClass: "dark:text-emerald-400" },
  "E": { key: "E", finger: "left-middle", hand: "left", name: "Left Middle (+ Right Shift)", colorClass: "text-emerald-600", darkColorClass: "dark:text-emerald-400" },
  "d": { key: "d", finger: "left-middle", hand: "left", name: "Left Middle (Home)", colorClass: "text-emerald-600", darkColorClass: "dark:text-emerald-400" },
  "D": { key: "D", finger: "left-middle", hand: "left", name: "Left Middle (Home + Right Shift)", colorClass: "text-emerald-600", darkColorClass: "dark:text-emerald-400" },
  "c": { key: "c", finger: "left-middle", hand: "left", name: "Left Middle", colorClass: "text-emerald-600", darkColorClass: "dark:text-emerald-400" },
  "C": { key: "C", finger: "left-middle", hand: "left", name: "Left Middle (+ Right Shift)", colorClass: "text-emerald-600", darkColorClass: "dark:text-emerald-400" },

  // Left Index
  "4": { key: "4", finger: "left-index", hand: "left", name: "Left Index", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "$": { key: "$", finger: "left-index", hand: "left", name: "Left Index (+ Right Shift)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "5": { key: "5", finger: "left-index", hand: "left", name: "Left Index Reach", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "%": { key: "%", finger: "left-index", hand: "left", name: "Left Index Reach (+ Right Shift)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "r": { key: "r", finger: "left-index", hand: "left", name: "Left Index", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "R": { key: "R", finger: "left-index", hand: "left", name: "Left Index (+ Right Shift)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "t": { key: "t", finger: "left-index", hand: "left", name: "Left Index Reach", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "T": { key: "T", finger: "left-index", hand: "left", name: "Left Index Reach (+ Right Shift)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "f": { key: "f", finger: "left-index", hand: "left", name: "Left Index (Home Bump •)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "F": { key: "F", finger: "left-index", hand: "left", name: "Left Index (Home Bump + Right Shift)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "g": { key: "g", finger: "left-index", hand: "left", name: "Left Index Reach", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "G": { key: "G", finger: "left-index", hand: "left", name: "Left Index Reach (+ Right Shift)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "v": { key: "v", finger: "left-index", hand: "left", name: "Left Index", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "V": { key: "V", finger: "left-index", hand: "left", name: "Left Index (+ Right Shift)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "b": { key: "b", finger: "left-index", hand: "left", name: "Left Index Reach", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },
  "B": { key: "B", finger: "left-index", hand: "left", name: "Left Index Reach (+ Right Shift)", colorClass: "text-amber-600", darkColorClass: "dark:text-amber-400" },

  // Space (Thumbs)
  " ": { key: "Space", finger: "thumb", hand: "thumb", name: "Thumb (Spacebar)", colorClass: "text-slate-600", darkColorClass: "dark:text-slate-400" },

  // Right Index
  "6": { key: "6", finger: "right-index", hand: "right", name: "Right Index Reach", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "^": { key: "^", finger: "right-index", hand: "right", name: "Right Index Reach (+ Left Shift)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "7": { key: "7", finger: "right-index", hand: "right", name: "Right Index", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "&": { key: "&", finger: "right-index", hand: "right", name: "Right Index (+ Left Shift)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "y": { key: "y", finger: "right-index", hand: "right", name: "Right Index Reach", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "Y": { key: "Y", finger: "right-index", hand: "right", name: "Right Index Reach (+ Left Shift)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "u": { key: "u", finger: "right-index", hand: "right", name: "Right Index", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "U": { key: "U", finger: "right-index", hand: "right", name: "Right Index (+ Left Shift)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "h": { key: "h", finger: "right-index", hand: "right", name: "Right Index Reach", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "H": { key: "H", finger: "right-index", hand: "right", name: "Right Index Reach (+ Left Shift)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "j": { key: "j", finger: "right-index", hand: "right", name: "Right Index (Home Bump •)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "J": { key: "J", finger: "right-index", hand: "right", name: "Right Index (Home Bump + Left Shift)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "n": { key: "n", finger: "right-index", hand: "right", name: "Right Index Reach", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "N": { key: "N", finger: "right-index", hand: "right", name: "Right Index Reach (+ Left Shift)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "m": { key: "m", finger: "right-index", hand: "right", name: "Right Index", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },
  "M": { key: "M", finger: "right-index", hand: "right", name: "Right Index (+ Left Shift)", colorClass: "text-orange-600", darkColorClass: "dark:text-orange-400" },

  // Right Middle
  "8": { key: "8", finger: "right-middle", hand: "right", name: "Right Middle", colorClass: "text-teal-600", darkColorClass: "dark:text-teal-400" },
  "*": { key: "*", finger: "right-middle", hand: "right", name: "Right Middle (+ Left Shift)", colorClass: "text-teal-600", darkColorClass: "dark:text-teal-400" },
  "i": { key: "i", finger: "right-middle", hand: "right", name: "Right Middle", colorClass: "text-teal-600", darkColorClass: "dark:text-teal-400" },
  "I": { key: "I", finger: "right-middle", hand: "right", name: "Right Middle (+ Left Shift)", colorClass: "text-teal-600", darkColorClass: "dark:text-teal-400" },
  "k": { key: "k", finger: "right-middle", hand: "right", name: "Right Middle (Home)", colorClass: "text-teal-600", darkColorClass: "dark:text-teal-400" },
  "K": { key: "K", finger: "right-middle", hand: "right", name: "Right Middle (Home + Left Shift)", colorClass: "text-teal-600", darkColorClass: "dark:text-teal-400" },
  ",": { key: ",", finger: "right-middle", hand: "right", name: "Right Middle", colorClass: "text-teal-600", darkColorClass: "dark:text-teal-400" },
  "<": { key: "<", finger: "right-middle", hand: "right", name: "Right Middle (+ Left Shift)", colorClass: "text-teal-600", darkColorClass: "dark:text-teal-400" },

  // Right Ring
  "9": { key: "9", finger: "right-ring", hand: "right", name: "Right Ring", colorClass: "text-indigo-600", darkColorClass: "dark:text-indigo-400" },
  "(": { key: "(", finger: "right-ring", hand: "right", name: "Right Ring (+ Left Shift)", colorClass: "text-indigo-600", darkColorClass: "dark:text-indigo-400" },
  "o": { key: "o", finger: "right-ring", hand: "right", name: "Right Ring", colorClass: "text-indigo-600", darkColorClass: "dark:text-indigo-400" },
  "O": { key: "O", finger: "right-ring", hand: "right", name: "Right Ring (+ Left Shift)", colorClass: "text-indigo-600", darkColorClass: "dark:text-indigo-400" },
  "l": { key: "l", finger: "right-ring", hand: "right", name: "Right Ring (Home)", colorClass: "text-indigo-600", darkColorClass: "dark:text-indigo-400" },
  "L": { key: "L", finger: "right-ring", hand: "right", name: "Right Ring (Home + Left Shift)", colorClass: "text-indigo-600", darkColorClass: "dark:text-indigo-400" },
  ".": { key: ".", finger: "right-ring", hand: "right", name: "Right Ring", colorClass: "text-indigo-600", darkColorClass: "dark:text-indigo-400" },
  ">": { key: ">", finger: "right-ring", hand: "right", name: "Right Ring (+ Left Shift)", colorClass: "text-indigo-600", darkColorClass: "dark:text-indigo-400" },

  // Right Pinky
  "0": { key: "0", finger: "right-pinky", hand: "right", name: "Right Pinky", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  ")": { key: ")", finger: "right-pinky", hand: "right", name: "Right Pinky (+ Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "-": { key: "-", finger: "right-pinky", hand: "right", name: "Right Pinky", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "_": { key: "_", finger: "right-pinky", hand: "right", name: "Right Pinky (+ Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "=": { key: "=", finger: "right-pinky", hand: "right", name: "Right Pinky", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "+": { key: "+", finger: "right-pinky", hand: "right", name: "Right Pinky (+ Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "p": { key: "p", finger: "right-pinky", hand: "right", name: "Right Pinky", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "P": { key: "P", finger: "right-pinky", hand: "right", name: "Right Pinky (+ Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "[": { key: "[", finger: "right-pinky", hand: "right", name: "Right Pinky", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "{": { key: "{", finger: "right-pinky", hand: "right", name: "Right Pinky (+ Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "]": { key: "]", finger: "right-pinky", hand: "right", name: "Right Pinky", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "}": { key: "}", finger: "right-pinky", hand: "right", name: "Right Pinky (+ Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  ";": { key: ";", finger: "right-pinky", hand: "right", name: "Right Pinky (Home)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  ":": { key: ":", finger: "right-pinky", hand: "right", name: "Right Pinky (Home + Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "'": { key: "'", finger: "right-pinky", hand: "right", name: "Right Pinky", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "\"": { key: "\"", finger: "right-pinky", hand: "right", name: "Right Pinky (+ Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "/": { key: "/", finger: "right-pinky", hand: "right", name: "Right Pinky", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
  "?": { key: "?", finger: "right-pinky", hand: "right", name: "Right Pinky (+ Left Shift)", colorClass: "text-rose-600", darkColorClass: "dark:text-rose-400" },
};

export function getKeyFingerInfo(char: string): KeyFingerInfo {
  if (CHARACTER_MAP[char]) {
    return CHARACTER_MAP[char];
  }
  // Default fallback
  return {
    key: char,
    finger: "right-index",
    hand: "right",
    name: "Right Hand",
    colorClass: "text-slate-600",
    darkColorClass: "dark:text-slate-400",
  };
}
