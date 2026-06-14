import { useEffect, useState } from "react";
import { getStoredSession, type ClientSession } from "./app-session";

export function useSession() {
  const [session, setSession] = useState<ClientSession | undefined>(() => getStoredSession());

  useEffect(() => {
    const sync = () => setSession(getStoredSession());
    window.addEventListener("storage", sync);
    window.addEventListener("xplore-session-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("xplore-session-change", sync);
    };
  }, []);

  return session;
}
