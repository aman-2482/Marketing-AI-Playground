import { getAuthUser } from "@/lib/auth";

function getProgressKey(): string {
  const user = getAuthUser();
  const userId = user ? user.userId : "guest";
  return `genai-marketing-lab-completed-${userId}`;
}

export function getCompletedActivities(): Set<string> {
  try {
    const stored = localStorage.getItem(getProgressKey());
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markActivityCompleted(slug: string): void {
  const completed = getCompletedActivities();
  completed.add(slug);
  localStorage.setItem(getProgressKey(), JSON.stringify([...completed]));
}
