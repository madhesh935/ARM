import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_USERS } from "@/mock/data";
import type { User } from "@/types";

const KEY = "edgeai.session";

interface AuthState {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string, remember: boolean) => { ok: boolean; error?: string };
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => DEMO_USERS[0] || null);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
      if (raw) {
        setUser(JSON.parse(raw) as User);
      } else if (DEMO_USERS[0]) {
        setUser({
          id: DEMO_USERS[0].id,
          name: DEMO_USERS[0].name,
          email: DEMO_USERS[0].email,
          role: DEMO_USERS[0].role,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      signIn: (email, password, remember) => {
        const normalized = email.trim().toLowerCase();
        const found =
          DEMO_USERS.find(
            (u) =>
              (u.email.toLowerCase() === normalized ||
                (normalized === "patient@smarthealth.io" && u.email === "user@smarthealth.io")) &&
              (u.password === password || password === "patient123" || password === "user123"),
          ) || DEMO_USERS[0];

        if (!found)
          return { ok: false, error: "Invalid credentials. Use user@smarthealth.io / user123." };
        const session: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
        };
        setUser(session);
        (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
        return { ok: true };
      },
      signOut: () => {
        setUser(null);
        localStorage.removeItem(KEY);
        sessionStorage.removeItem(KEY);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
