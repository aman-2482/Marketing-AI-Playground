export interface AuthUser {
  token: string;
  username: string;
  email: string;
  userId: number;
}

const KEY = "auth_user";

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(KEY);
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}
