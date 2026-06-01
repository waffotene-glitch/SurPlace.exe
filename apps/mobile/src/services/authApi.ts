import { apiRequest } from "./http";
import { AuthResponse, AuthUser, UserRole } from "../types/api";

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function register(payload: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function getMe(token: string) {
  return apiRequest<{ user: AuthUser }>("/auth/me", { token });
}

