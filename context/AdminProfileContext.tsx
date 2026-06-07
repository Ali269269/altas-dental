"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getToken } from "@/utils/auth";
import { fetchSettingsOverview } from "@/utils/settingsApi";
import type { SettingsProfile } from "@/utils/settingsData";

type AdminProfileContextValue = {
  profile: SettingsProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<SettingsProfile | null>;
  setProfile: (profile: SettingsProfile) => void;
};

const AdminProfileContext = createContext<AdminProfileContextValue | null>(null);

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const data = await fetchSettingsOverview();
      setProfile(data.profile);
      return data.profile;
    } catch (error) {
      console.error("Failed to load admin profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      profile,
      loading,
      refreshProfile,
      setProfile,
    }),
    [profile, loading, refreshProfile]
  );

  return (
    <AdminProfileContext.Provider value={value}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const context = useContext(AdminProfileContext);
  if (!context) {
    throw new Error("useAdminProfile must be used within AdminProfileProvider");
  }
  return context;
}
