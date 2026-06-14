export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "club_admin" | "admin";
};

export type ClientSession = {
  token: string;
  user: SessionUser;
};

const SESSION_KEY = "xplore-session";

export function getStoredSession(): ClientSession | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ClientSession) : undefined;
  } catch {
    return undefined;
  }
}

export function storeSession(session: ClientSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("xplore-session-change"));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("xplore-session-change"));
}
