"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  const loadFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("av_token");
    const userStr = localStorage.getItem("av_user");
    if (token && userStr) {
      try {
        setState({ user: JSON.parse(userStr), token, loading: false });
        // Set cookie for middleware
        document.cookie = `av_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      } catch {
        setState({ user: null, token: null, loading: false });
      }
    } else {
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const login = (token: string, user: User) => {
    localStorage.setItem("av_token", token);
    localStorage.setItem("av_user", JSON.stringify(user));
    document.cookie = `av_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    setState({ user, token, loading: false });
  };

  const logout = () => {
    localStorage.removeItem("av_token");
    localStorage.removeItem("av_user");
    document.cookie = "av_token=; path=/; max-age=0";
    setState({ user: null, token: null, loading: false });
    window.location.href = "/login";
  };

  const updateUser = (updates: Partial<User>) => {
    setState((prev) => {
      const updated = { ...prev.user, ...updates } as User;
      localStorage.setItem("av_user", JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  };

  // Memoized — stable reference, won't trigger useEffect re-runs on every render
  const authHeaders = useMemo(
    () => (state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    [state.token]
  );

  return { ...state, login, logout, updateUser, authHeaders };
}
