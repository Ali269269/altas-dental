"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext"; // adjust path as needed
import { Search, Bell, Sun, Moon, X } from "lucide-react";
import Image from "next/image";


// ── Types ────────────────────────────────────────────────────────────────────
interface Notification {
  id: number;
  name: string;
  service: string;
  date: string;
  timeAgo: string;
}

interface HeaderAdminProps {
  title: string;          // page title — passed per page
  userImage?: string;     // URL for admin avatar (optional, falls back to initials)
  userName?: string;      // admin full name
}

// ── Static demo notifications (replace with real data / props as needed) ─────
const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 1, name: "Lucy Van Pelt",       service: "Aligneurs",   date: "Oct 28", timeAgo: "2h ago" },
  { id: 2, name: "Franklin Armstrong",  service: "Endodontie",  date: "Oct 30", timeAgo: "4h ago" },
  { id: 3, name: "Franklin Armstrong",  service: "Endodontie",  date: "Oct 30", timeAgo: "4h ago" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeaderAdmin({
  title,
  userImage,
  userName = "Admin",
}: HeaderAdminProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [notifOpen, setNotifOpen]   = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initials fallback for avatar
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Format today's date: "Thursday, March 19th, 2026"
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <header
  className={`
    fixed top-0 left-[285px] rounded-l-2xl right-0 z-30 h-[72px]
    flex items-center justify-between px-8
    transition-all duration-300
    ${scrolled
      ? `backdrop-blur-lg shadow-md
         ${isDark
           ? "bg-white/10 border-b border-white/10"
           : "bg-[#711C31]/10 border-b border-[#711C31]/10"
         }`
      : "bg-transparent"
    }
  `}
>
      {/* ── Left: Title + Date ───────────────────────────────── */}
      <div className="flex flex-col justify-center leading-tight">
        <h1
          className={`
            text-2xl font-bold tracking-wide capitalize
            ${isDark ? "text-[#F5ECD7]" : "text-[#591727]"}
          `}
         
        >
          {title}
        </h1>
        <p
          className={`text-xs mt-0.5 ${isDark ? "text-[#D1CDCE]" : "text-[#5D5153]"}`}
         
        >
          {formattedDate}
        </p>
      </div>

      {/* ── Right: Search + Theme + Notif + Avatar ───────────── */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border-amber-400 text-sm w-52
            transition-colors duration-300
            ${isDark
              ? "bg-[#3D0A1F] border border-[#5C1A30] text-[#711C31] placeholder:text-[#A07850]"
              : "bg-[#EBD9B8] border border-[#D4B896] text-[#ffffff] placeholder:text-[#ffffff]"
            }
          `}
        >
          <Search size={14} className={isDark ? "text-[#ffffff]" : "text-[#711C31]"} />
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
   className={`bg-transparent outline-none w-full text-sm ${
  isDark ? "text-white" : "text-[#711C31]"
}`}
            style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}
          />
          {searchValue && (
            <button onClick={() => setSearchValue("")}>
              <X size={12} className={isDark ? "text-[#A07850]" : "text-[#7A6040]"} />
            </button>
          )}
        </div>

        {/* Light / Dark toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`
            border-amber-400 w-9 h-9 rounded-lg flex items-center justify-center
            transition-all duration-200
            ${isDark
              ? "bg-[#3D0A1F] border border-[#5C1A30] text-[#D4A574] hover:bg-[#5C1A30]"
              : "bg-[#EBD9B8] border border-[#D4B896] text-[#3D0A1F] hover:bg-[#D4B896]"
            }
          `}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center relative border-amber-400
              transition-all duration-200
              ${isDark
                ? "bg-[#3D0A1F] border border-[#5C1A30] text-[#F5ECD7] hover:bg-[#5C1A30]"
                : "bg-[#EBD9B8] border border-[#D4B896] text-[#3D0A1F] hover:bg-[#D4B896]"
              }
            `}
          >
            <Bell size={16} />
            {/* Badge */}
            {DEMO_NOTIFICATIONS.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8B1A2E] text-white text-[9px] font-bold flex items-center justify-center">
                {DEMO_NOTIFICATIONS.length}
              </span>
            )}
          </button>

          {/* ── Notification Dropdown ─────────────────────────── */}
          {notifOpen && (
            <div
              className={`
                absolute right-0 top-11 w-80 rounded-xl shadow-2xl z-50
                transition-colors duration-300
                ${isDark
                  ? "bg-[#5C1A30] border border-[#5C1A30] text-[#F5ECD7]"
                  : "bg-[#F5ECD7] border border-[#D4B896] text-[#591727]"
                }
              `}
            >
              {/* Header */}
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}
                >
                  notification
                </span>
              </div>

              {/* Title row */}
              <div className="px-4 pb-3 flex items-center gap-2">
                <span
                  className={`text-base font-bold ${isDark ? "text-[#F5ECD7]" : "text-[#591727]"}`}
                  style={{ fontFamily: "var(--font-display, 'Cormorant Garamond', serif)" }}
                >
                  Pending Confirmations
                </span>
                <span className="w-5 h-5 rounded-full bg-[#8B1A2E] text-white text-[10px] font-bold flex items-center justify-center">
                  {DEMO_NOTIFICATIONS.length}
                </span>
              </div>

              {/* Notification cards */}
              <div className="px-4 flex flex-col gap-3 pb-3">
                {DEMO_NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`
                      rounded-xl p-3
                      ${isDark ? "bg-[#3D0A1F]" : "bg-[#EBD9B8]"}
                    `}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-sm font-semibold ${isDark ? "text-[#F5ECD7]" : "text-[#591727]"}`}
                        style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}
                      >
                        {n.name}
                      </span>
                      <span className={`text-xs ${isDark ? "text-[#A07850]" : "text-[#7A6040]"}`}>
                        {n.timeAgo}
                      </span>
                    </div>
                    <p className={`text-xs mb-2.5 ${isDark ? "text-[#A07850]" : "text-[#7A6040]"}`}>
                      {n.service} · {n.date}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 rounded-lg bg-[#591727] text-[#F5ECD7] text-xs font-semibold hover:bg-[#5C1A30] transition-colors">
                        Call
                      </button>
                      <button
                        className={`
                          flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                          ${isDark
                            ? "border-[#5C1A30] text-[#F5ECD7] hover:bg-[#5C1A30]"
                            : "border-[#D4B896] text-[#3D0A1F] hover:bg-[#D4B896]"
                          }
                        `}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className={`
                  px-4 py-3 text-center text-xs font-semibold cursor-pointer
                  border-t transition-colors
                  ${isDark
                    ? "border-[#5C1A30] text-[#D4A574] hover:text-[#F5ECD7]"
                    : "border-[#D4B896] text-[#7A3048] hover:text-[#3D0A1F]"
                  }
                `}
              >
                View All Requests
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-[#D4A574] shrink-0">
          {userImage ? (
            <Image
              src="/images/docterpc.png"
              alt={userName}
              width={39}
              height={39}
              className="object-cover w-full h-full scale-125"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-[#7A3048] text-[#F5ECD7] text-xs font-bold"
              
            >
              {initials}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
