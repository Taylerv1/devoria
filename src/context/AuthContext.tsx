"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthChange, User } from "@/firebase/auth";
import { getDocument } from "@/firebase/firestore";

export type UserRole = "admin" | "editor" | "blog_manager";

const VALID_ROLES: readonly UserRole[] = ["admin", "editor", "blog_manager"];

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Refresh the session cookie with a fresh (potentially renewed) token.
          // Firebase ID tokens expire after 1 hour — this keeps the session alive.
          const idToken = await firebaseUser.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          // Fetch the user's role from Firestore — no fallback allowed
          const doc = await getDocument("users", firebaseUser.uid);
          const raw = doc as unknown as Partial<UserProfile> | null;

          if (raw && raw.role && (VALID_ROLES as readonly string[]).includes(raw.role)) {
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              role: raw.role,
              displayName: raw.displayName,
            });
          } else {
            // Authenticated with Firebase but no valid admin profile —
            // deny access. Do NOT silently elevate any user to admin.
            setProfile(null);
          }
        } catch (err) {
          // On any error (network, Firestore unavailable) — fail closed
          console.error("[Auth] Firestore error:", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
