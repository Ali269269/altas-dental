"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import AuthSessionWatcher from "@/components/admin/AuthSessionWatcher";

import { ReactNode } from "react";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname?.startsWith("/login/");

  if (isDashboard || isAuthPage) {
    return (
      <ThemeProvider>
        <AuthSessionWatcher />
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AuthSessionWatcher />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </ThemeProvider>
  );
}
