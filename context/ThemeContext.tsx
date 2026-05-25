"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Persist to localStorage
  useEffect(() => {
    const stored = localStorage.getItem("atlas-theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.style.backgroundColor = theme === "dark" ? "#2A0812" : "#FFFFFF";
    document.body.style.transition = "background-color 0.3s";
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}


