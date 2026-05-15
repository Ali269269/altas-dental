"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // We might want to get the title from the page, but for a layout we can use a default
  // or use a more sophisticated way to pass title (like a store or context)
  // For now, let's just use AdminLayout here.
  
  return (
    <AdminLayout 
        title="Dashboard" 
        userImage="/images/admin-avatar.jpg" 
        userName="Admin"
    >
      {children}
    </AdminLayout>
  );
}
