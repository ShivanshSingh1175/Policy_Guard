"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "./api";
import type { User } from "./types";
import { DEMO_USER, DEMO_TOKEN } from "./mock-data";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isDemo: boolean;
  login: (token: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isDemo: false,
  login: async () => {},
  loginDemo: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("policyguard_token");
      localStorage.removeItem("policyguard_demo");
    }
  }, []);

  useEffect(() => {
    const demoFlag = localStorage.getItem("policyguard_demo");
    if (demoFlag === "true") {
      setUser(DEMO_USER);
      setToken(DEMO_TOKEN);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem("policyguard_token");
    if (stored) {
      setToken(stored);
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (newToken: string) => {
    localStorage.setItem("policyguard_token", newToken);
    localStorage.removeItem("policyguard_demo");
    setToken(newToken);
    setIsDemo(false);
    await fetchUser();
  };

  const loginDemo = () => {
    localStorage.setItem("policyguard_demo", "true");
    localStorage.setItem("policyguard_token", DEMO_TOKEN);
    setToken(DEMO_TOKEN);
    setUser(DEMO_USER);
    setIsDemo(true);
  };

  const logout = () => {
    localStorage.removeItem("policyguard_token");
    localStorage.removeItem("policyguard_demo");
    setToken(null);
    setUser(null);
    setIsDemo(false);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isDemo, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
