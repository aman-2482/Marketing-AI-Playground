const SESSION_KEY = "genai-marketing-lab-session";

/** Returns the current browser session ID, creating one if it doesn't exist. */
export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
