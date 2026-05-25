"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import HeaderAdmin from "./HeaderAdmin";
import { useTheme } from "@/context/ThemeContext";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  userImage?: string;
  userName?: string;
}

export default function AdminLayout({
  children,
  title,
  userImage,
  userName,
}: AdminLayoutProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={{ backgroundColor: isDark ? "#2A0812" : "#FFFFFF" }}
    >
      {/* Sidebar — receives open/onClose for mobile drawer */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[220px] min-w-0">

        {/* Header — receives onMenuClick to open drawer on mobile */}
        <HeaderAdmin
          title={title}
          userImage={userImage}
          userName={userName}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page body */}
        <main className="flex-1 pt-[72px] p-4 sm:p-7 lg:pt-18 ml-0 lg:ml-5 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}