"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  isDashboardSessionActive,
  validateAuthSession,
} from "@/utils/auth";

export function useDashboardAuthGuard() {
  const router = useRouter();

  const revalidateSession = useCallback(async () => {
    if (!isDashboardSessionActive()) {
      router.replace("/login");
      return false;
    }

    const session = await validateAuthSession();
    if (!session) {
      router.replace("/login");
      return false;
    }

    return true;
  }, [router]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void revalidateSession();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void revalidateSession();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [revalidateSession]);

  return { revalidateSession };
}
