"use client";

import { useState, useEffect } from "react";
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

  // Prevent double vertical scrollbars (html h-full + nested flex min-h-screen).
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlHeight: html.style.height,
      htmlMinHeight: html.style.minHeight,
      htmlOverflowY: html.style.overflowY,
      bodyOverflowY: body.style.overflowY,
    };
    html.style.height = "auto";
    html.style.minHeight = "100%";
    html.style.overflowY = "visible";
    body.style.overflowY = "visible";
    return () => {
      html.style.height = prev.htmlHeight;
      html.style.minHeight = prev.htmlMinHeight;
      html.style.overflowY = prev.htmlOverflowY;
      body.style.overflowY = prev.bodyOverflowY;
    };
  }, []);

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={{ backgroundColor: isDark ? "#2A0812" : "#FFFFFF" }}
    >
      {/* Sidebar — receives open/onClose for mobile drawer */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-[220px] min-w-0">

        {/* Header — receives onMenuClick to open drawer on mobile */}
        <HeaderAdmin
          title={title}
          userImage={userImage}
          userName={userName}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page body */}
        <main className="pt-[72px] p-4 sm:p-7 lg:pt-18 ml-0 lg:ml-5 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}