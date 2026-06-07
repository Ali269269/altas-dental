"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedDashboard from "./ProtectedDashboard";
import { AdminProfileProvider, useAdminProfile } from "@/context/AdminProfileContext";
import { PermissionsProvider } from "@/context/PermissionsContext";
import { ReactNode } from "react";

function DashboardShell({ children }: { children: ReactNode }) {
  const { profile } = useAdminProfile();

  return (
    <AdminLayout
      title="Dashboard"
      userImage={profile?.profilePhoto || undefined}
      userName={profile?.fullName || "Admin"}
    >
      {children}
    </AdminLayout>
  );
}

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  return (
    <PermissionsProvider>
      <ProtectedDashboard>
        <AdminProfileProvider>
          <DashboardShell>{children}</DashboardShell>
        </AdminProfileProvider>
      </ProtectedDashboard>
    </PermissionsProvider>
  );
}
