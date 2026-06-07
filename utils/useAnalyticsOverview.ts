"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/utils/api";
import { getToken } from "@/utils/auth";
import {
  DEFAULT_ANALYTICS_OVERVIEW,
  mergeAnalyticsOverview,
  type AnalyticsOverview,
} from "@/utils/analyticsData";

const REFRESH_MS = 30_000;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export type AnalyticsFetchState = {
  data: AnalyticsOverview;
  loading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  refresh: () => Promise<void>;
};

export function useAnalyticsOverview(
  enabled = true,
  refreshIntervalMs = REFRESH_MS
): AnalyticsFetchState {
  const [data, setData] = useState<AnalyticsOverview>(DEFAULT_ANALYTICS_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const fetchingRef = useRef(false);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const response = await fetch(apiUrl("/api/statistics/analytics-overview"), {
        headers: authHeaders(),
        cache: "no-store",
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(json.message || `Request failed (${response.status})`);
      }

      setData(mergeAnalyticsOverview(json.data));
      setError(null);
      setLastFetchedAt(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load analytics data.";
      setError(message);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      if (!cancelled) await refresh();
    };

    load();
    const intervalId = window.setInterval(load, refreshIntervalMs);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, refresh, refreshIntervalMs]);

  return { data, loading, error, lastFetchedAt, refresh };
}
