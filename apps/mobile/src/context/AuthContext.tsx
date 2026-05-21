import React, { createContext, useContext, useEffect, useState } from "react";
import { login, register, getMe } from "../services/authApi";
import { clearStoredSession, getStoredSession, saveSession } from "../services/authStorage";
import { AuthUser, UserRole } from "../types/api";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await getStoredSession();
        if (!stored.token || !stored.user) {
          return;
        }

        const parsedUser = JSON.parse(stored.user) as AuthUser;
        setToken(stored.token);
        setUser(parsedUser);

        const fresh = await getMe(stored.token);
        setUser(fresh.user);
        await saveSession(stored.token, JSON.stringify(fresh.user));
      } catch (_error) {
        await clearStoredSession();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restore();
  }, []);

  const persistSession = async (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    await saveSession(nextToken, JSON.stringify(nextUser));
  };

  const signIn = async (payload: { email: string; password: string }) => {
    const response = await login(payload);
    await persistSession(response.token, response.user);
  };

  const signUp = async (payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    const response = await register(payload);
    await persistSession(response.token, response.user);
  };

  const signOut = async () => {
    await clearStoredSession();
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) {
      return;
    }

    const response = await getMe(token);
    setUser(response.user);
    await saveSession(token, JSON.stringify(response.user));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}