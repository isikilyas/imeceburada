"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import {
  AuthResponse,
  AuthTokens,
  AuthUser,
  LoginInput,
  RegisterCandidateInput,
  RegisterCompanyInput,
  RegisterSupplierInput,
  RegisterSubcontractorInput,
} from "@imeceburada/shared";
import { apiFetch, ApiError } from "./api-client";

const STORAGE_KEY = "imeceburada.auth";

interface StoredAuth {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * "local" (Oturumu Açık Tut açık) tarayıcı kapatılıp açılsa bile oturumu korur.
 * "session" (kapalı) sekme/tarayıcı kapanınca oturumu otomatik sonlandırır.
 */
type StorageMode = "local" | "session";

function getStorage(mode: StorageMode): Storage {
  return mode === "local" ? window.localStorage : window.sessionStorage;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: LoginInput, keepSignedIn?: boolean) => Promise<void>;
  requestPhoneLogin: (phone: string) => Promise<void>;
  verifyPhoneLogin: (phone: string, code: string, keepSignedIn?: boolean) => Promise<void>;
  registerCandidate: (input: RegisterCandidateInput) => Promise<void>;
  registerCompany: (input: RegisterCompanyInput) => Promise<void>;
  registerSupplier: (input: RegisterSupplierInput) => Promise<void>;
  registerSubcontractor: (input: RegisterSubcontractorInput) => Promise<void>;
  logout: () => void;
  authFetch: <T>(path: string, options?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredAuth | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fromLocal = window.localStorage.getItem(STORAGE_KEY);
    if (fromLocal) {
      try {
        setState(JSON.parse(fromLocal));
        setStorageMode("local");
        setIsLoading(false);
        return;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    const fromSession = window.sessionStorage.getItem(STORAGE_KEY);
    if (fromSession) {
      try {
        setState(JSON.parse(fromSession));
        setStorageMode("session");
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback(
    (data: StoredAuth | null, keepSignedIn?: boolean) => {
      const mode: StorageMode = keepSignedIn === undefined ? storageMode : keepSignedIn ? "local" : "session";
      setState(data);
      setStorageMode(mode);
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
      if (data) getStorage(mode).setItem(STORAGE_KEY, JSON.stringify(data));
    },
    [storageMode],
  );

  const applyAuthResponse = useCallback(
    (res: AuthResponse, keepSignedIn: boolean) => {
      persist({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }, keepSignedIn);
    },
    [persist],
  );

  const login = useCallback(
    async (input: LoginInput, keepSignedIn = true) => {
      const res = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      applyAuthResponse(res, keepSignedIn);
    },
    [applyAuthResponse],
  );

  const requestPhoneLogin = useCallback(async (phone: string) => {
    await apiFetch("/auth/login/phone/request", { method: "POST", body: JSON.stringify({ phone }) });
  }, []);

  const verifyPhoneLogin = useCallback(
    async (phone: string, code: string, keepSignedIn = true) => {
      const res = await apiFetch<AuthResponse>("/auth/login/phone/verify", {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      });
      applyAuthResponse(res, keepSignedIn);
    },
    [applyAuthResponse],
  );

  const registerCandidate = useCallback(
    async (input: RegisterCandidateInput) => {
      const res = await apiFetch<AuthResponse>("/auth/register/candidate", {
        method: "POST",
        body: JSON.stringify(input),
      });
      applyAuthResponse(res, true);
    },
    [applyAuthResponse],
  );

  const registerCompany = useCallback(
    async (input: RegisterCompanyInput) => {
      const res = await apiFetch<AuthResponse>("/auth/register/company", {
        method: "POST",
        body: JSON.stringify(input),
      });
      applyAuthResponse(res, true);
    },
    [applyAuthResponse],
  );

  const registerSupplier = useCallback(
    async (input: RegisterSupplierInput) => {
      const res = await apiFetch<AuthResponse>("/auth/register/supplier", {
        method: "POST",
        body: JSON.stringify(input),
      });
      applyAuthResponse(res, true);
    },
    [applyAuthResponse],
  );

  const registerSubcontractor = useCallback(
    async (input: RegisterSubcontractorInput) => {
      const res = await apiFetch<AuthResponse>("/auth/register/subcontractor", {
        method: "POST",
        body: JSON.stringify(input),
      });
      applyAuthResponse(res, true);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    setState(null);
  }, []);

  const authFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      if (!state) throw new ApiError(401, "Oturum açmanız gerekiyor");
      try {
        return await apiFetch<T>(path, { ...options, accessToken: state.accessToken });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const refreshed = await apiFetch<AuthTokens>("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken: state.refreshToken }),
          });
          const next: StoredAuth = { ...state, ...refreshed };
          persist(next);
          return apiFetch<T>(path, { ...options, accessToken: refreshed.accessToken });
        }
        throw err;
      }
    },
    [state, persist],
  );

  return (
    <AuthContext.Provider
      value={{
        user: state?.user ?? null,
        isLoading,
        login,
        requestPhoneLogin,
        verifyPhoneLogin,
        registerCandidate,
        registerCompany,
        registerSupplier,
        registerSubcontractor,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
