"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { endDashboardSession } from "@/utils/auth";

function isDashboardPath(path: string | null): boolean {
  return Boolean(path?.startsWith("/dashboard"));
}

export default function AuthSessionWatcher() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    if (isDashboardPath(previousPath) && !isDashboardPath(pathname)) {
      endDashboardSession();
    }
    previousPathRef.current = pathname;
  }, [pathname]);

  return null;
}
