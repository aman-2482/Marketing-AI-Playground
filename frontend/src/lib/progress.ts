import { getAuthUser } from "@/lib/auth";
import { listHistory } from "@/lib/api";
import { getSessionId } from "@/lib/session";

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

/**
 * Uses backend history as the source of truth for completed activities and
 * updates local cache so stale browser data does not survive DB resets.
 */
export async function getCompletedActivitiesSynced(): Promise<Set<string>> {
  try {
    const history = await listHistory(getSessionId(), 500);
    const completed = new Set(
      history
        .map((entry) => entry.activity_slug)
        .filter((slug): slug is string => Boolean(slug) && slug !== "__compare__")
    );
    localStorage.setItem(getProgressKey(), JSON.stringify([...completed]));
    return completed;
  } catch {
    // If history is unavailable, fall back to cached local progress.
    return getCompletedActivities();
  }
}
