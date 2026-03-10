import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Maps activity icon slugs to their emoji representation. */
export const ICON_MAP: Record<string, string> = {
  "share-2":   "📱",
  mail:        "📧",
  megaphone:   "📢",
  palette:     "🎨",
  repeat:      "🔄",
  users:       "👥",
  search:      "🔍",
  "git-branch":"🔀",
};

export const DEFAULT_ICON = "⚙️";
