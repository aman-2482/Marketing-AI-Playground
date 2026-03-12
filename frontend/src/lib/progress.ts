const PROGRESS_KEY = "genai-marketing-lab-completed";

export function getCompletedActivities(): Set<string> {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markActivityCompleted(slug: string): void {
  const completed = getCompletedActivities();
  completed.add(slug);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...completed]));
}
