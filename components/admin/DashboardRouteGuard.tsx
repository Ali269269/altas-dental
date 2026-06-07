"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/context/PermissionsContext";
import {
  firstAllowedDashboardPath,
  getModuleForPath,
} from "@/utils/permissions";

export default function DashboardRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading, canViewModule } = usePermissions();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading || !session) {
      setAllowed(null);
      return;
    }

    const moduleKey = getModuleForPath(pathname);
    if (!moduleKey) {
      setAllowed(true);
      return;
    }

    if (!canViewModule(moduleKey)) {
      const fallback = firstAllowedDashboardPath(
        session.permissions,
        session.isSuperAdmin
      );
      router.replace(fallback);
      setAllowed(false);
      return;
    }

    setAllowed(true);
  }, [loading, session, pathname, canViewModule, router]);

  if (loading || allowed === null) {
    return (
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#591727" }}>Checking access...</p>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
