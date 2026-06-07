"use client";

import Sidebar from "@/components/admin/Sidebar";
import HeaderAdmin from "@/components/admin/HeaderAdmin";

import { useTheme } from "@/context/ThemeContext";   // adjust import paths as needed
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;         // Page title passed from each page
  userImage?: string;    // Optional admin avatar URL
  userName?: string;     // Optional admin name for initials fallback
}

export default function AdminLayout({
  children,
  title,
  userImage,
  userName,
}: AdminLayoutProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="dashboard-shell flex transition-colors duration-300"
      style={{ backgroundColor: isDark ? "#2A0812" : "#F0E4C8" }}
    >
      <Sidebar />

      <div className="dashboard-main flex-1 ml-[220px] flex flex-col">
        <HeaderAdmin title={title} userImage={userImage} userName={userName} />

        <main className="dashboard-content pt-[72px] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
