"use client";

import Sidebar from "./Sidebar";
import HeaderAdmin from "./HeaderAdmin";
import { useTheme } from "@/context/ThemeContext";

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
      className="min-h-screen flex transition-colors duration-300"
      style={{ backgroundColor: isDark ? "#2A0812" : "#F0E4C8" }}
    >
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content area — offset from sidebar */}
      <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
        {/* Fixed Header */}
        <HeaderAdmin title={title} userImage={userImage} userName={userName} />

        {/* Page body — padded below the fixed header */}
        <main className="flex-1 pt-[72px] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
