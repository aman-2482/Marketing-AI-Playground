import { getAuthUser } from "@/lib/auth";

function getSessionKey(): string {
  const user = getAuthUser();
  const userId = user ? user.userId : "guest";
  return `genai-marketing-lab-session-${userId}`;
}

/** Returns the current user-specific session ID, creating one if it doesn't exist. */
export function getSessionId(): string {
  const key = getSessionKey();
  let id = localStorage.getItem(key);
  if (!id) {
    const user = getAuthUser();
    const userPart = user ? `user-${user.userId}` : "guest";
    id = `${userPart}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, id);
  }
  return id;
}
