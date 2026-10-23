"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  college: string;
  degree: string;
  batch: string;
  cgpa: string;
  city: string;
  state: string;
  skills: string[];
  interests: string[];
  orgName?: string;
  orgType?: string;
  orgWebsite?: string;
  avatar?: string; // data URL or remote URL
}

interface UserContextValue {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  syncFromAPI: (email: string) => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  username: "",
  email: "",
  phone: "",
  bio: "",
  college: "",
  degree: "",
  batch: "",
  cgpa: "",
  city: "",
  state: "",
  skills: [],
  interests: [],
};

const STORAGE_KEY = "applyguru_profile";

const UserContext = createContext<UserContextValue>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  syncFromAPI: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const syncFromAPI = useCallback(async (email: string) => {
    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const { user } = await res.json();
      if (!user) return;
      const merged: Partial<UserProfile> = {
        name:     user.name     || "",
        email:    user.email    || email,
        phone:    user.phone    || "",
        college:  user.college  || "",
        degree:   user.degree   || "",
        city:     user.city     || "",
        state:    user.state    || "",
        username: user.username || "",
        orgName:  user.orgName  || undefined,
        orgType:  user.orgType  || undefined,
        avatar:   user.avatar   || undefined,
      };
      setProfile((prev) => {
        // Only overwrite fields that are still empty (don't stomp user edits)
        const next = { ...prev };
        for (const [k, v] of Object.entries(merged)) {
          if (v && !prev[k as keyof UserProfile]) (next as Record<string, unknown>)[k] = v;
        }
        // Always sync name + email from API (most reliable source)
        if (merged.name)  next.name  = merged.name;
        if (merged.email) next.email = merged.email;
        if (merged.avatar) next.avatar = merged.avatar;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    } catch {}
  }, []);

  return (
    <UserContext.Provider value={{ profile, updateProfile, syncFromAPI }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
