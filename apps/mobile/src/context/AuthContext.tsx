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