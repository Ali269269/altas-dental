"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedDashboard from "./ProtectedDashboard";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedDashboard>
      <AdminLayout 
          title="Dashboard" 
          userImage="/images/admin-avatar.jpg" 
          userName="Admin"
      >
        {children}
      </AdminLayout>
    </ProtectedDashboard>
  );
}
