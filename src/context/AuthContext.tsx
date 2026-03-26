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
import {
  AdminPermissionMatrix,
  hasAnyAdminAccess,
  isSystemRoleId,
  resolveRoleDefinition,
} from "@/lib/admin-permissions";

export type UserRole = string;

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  roleName: string;
  permissions: AdminPermissionMatrix;
  displayName?: string;
  isSystemRole: boolean;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          const userDoc = await getDocument("users", firebaseUser.uid);
          const rawProfile = isRecord(userDoc)
            ? (userDoc as Record<string, unknown>)
            : null;
          const roleId =
            rawProfile && typeof rawProfile.role === "string"
              ? rawProfile.role.trim()
              : "";

          if (!roleId) {
            setProfile(null);
            setLoading(false);
            return;
          }

          const roleDoc = isSystemRoleId(roleId)
            ? null
            : await getDocument("roles", roleId);
          const roleDefinition = resolveRoleDefinition(roleId, roleDoc);

          if (!roleDefinition || !hasAnyAdminAccess({
            role: roleId,
            permissions: roleDefinition.permissions,
          })) {
            setProfile(null);
            setLoading(false);
            return;
          }

          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            role: roleId,
            roleName: roleDefinition.name,
            permissions: roleDefinition.permissions,
            displayName:
              typeof rawProfile?.displayName === "string"
                ? rawProfile.displayName
                : undefined,
            isSystemRole: roleDefinition.isSystem,
          });
        } catch (err) {
          console.error("[Auth] Role resolution error:", err);
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
