"use client";

import { useState, useLayoutEffect } from "react";
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

  useLayoutEffect(() => {
    document.documentElement.classList.add("dashboard-route");
    document.body.classList.add("dashboard-route");
    return () => {
      document.documentElement.classList.remove("dashboard-route");
      document.body.classList.remove("dashboard-route");
    };
  }, []);

  return (
    <div
      className="dashboard-shell flex transition-colors duration-300"
      style={{ backgroundColor: isDark ? "#2A0812" : "#FFFFFF" }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main flex-1 flex flex-col lg:ml-[220px] min-w-0">
        <HeaderAdmin
          title={title}
          userImage={userImage}
          userName={userName}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="dashboard-content pt-[72px] p-4 sm:p-7 lg:pt-18 ml-0 lg:ml-5 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}