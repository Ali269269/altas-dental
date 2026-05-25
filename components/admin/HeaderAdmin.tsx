"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Search, Bell, Sun, Moon, X, Menu } from "lucide-react";
import Image from "next/image";

interface Notification {
  id: number;
  name: string;
  service: string;
  date: string;
  timeAgo: string;
}

interface HeaderAdminProps {
  title: string;
  userImage?: string;
  userName?: string;
  onMenuClick?: () => void; // ← new
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 1, name: "Lucy Van Pelt",      service: "Aligneurs",  date: "Oct 28", timeAgo: "2h ago" },
  { id: 2, name: "Franklin Armstrong", service: "Endodontie", date: "Oct 30", timeAgo: "4h ago" },
  { id: 3, name: "Franklin Armstrong", service: "Endodontie", date: "Oct 30", timeAgo: "4h ago" },
];

export default function HeaderAdmin({
  title,
  userImage,
  userName = "Admin",
  onMenuClick,
}: HeaderAdminProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [notifOpen, setNotifOpen]     = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrolled, setScrolled]       = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header
      className="fixed top-0 right-0 z-30 h-[72px] flex items-center justify-between px-4 lg:px-8 transition-all duration-300 left-0 lg:left-[285px] lg:rounded-l-2xl bg-transparent"
    >
      {/* ── Left: Title + Date only ── */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col justify-center leading-tight">
          <h1
            className={`
              text-lg lg:text-2xl font-bold tracking-wide capitalize
              ${isDark ? "text-[#F5ECD7]" : "text-[#591727]"}
            `}
          >
            {title}
          </h1>
          <p className={`text-xs mt-0.5 hidden sm:block ${isDark ? "text-[#D1CDCE]" : "text-[#5D5153]"}`}>
            {formattedDate}
          </p>
        </div>
      </div>

      {/* ── Right: Search + Theme + Notif + Avatar + Hamburger ── */}
      <div className="flex items-center gap-2 lg:gap-3">

        {/* Search — hidden on very small screens */}
        <div
          className={`
            hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-40 lg:w-52
            transition-colors duration-300
            ${isDark
              ? "bg-[#D3D3D3] border text-[#711C31] placeholder:text-[#5C1A30]"
              : "bg-[#D3D3D3] border border-[#753141] text-[#ffffff] placeholder:text-[#D3D3D3]"
            }
          `}
        >
          <Search size={14} className={isDark ? "text-[#5C1A30]" : "text-[#711C31]"} />
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`bg-transparent outline-none w-full text-sm ${
              isDark ? "text-[#711C31]" : "text-[#711C31]"
            }`}
            style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}
          />
          {searchValue && (
            <button onClick={() => setSearchValue("")}>
              <X size={12} className={isDark ? "text-[#A07850]" : "text-[#7A6040]"} />
            </button>
          )}
        </div>
        {/* Hamburger — mobile only, now on the RIGHT */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className={`
            lg:hidden w-9 h-9 rounded-lg flex items-center justify-center shrink-0
            transition-all duration-200
            ${isDark
              ? "bg-[#D3D3D3] border border-[#5C1A30] text-[#5C1A30] hover:bg-white"
              : "bg-[#D3D3D3] border border-[#753141] text-[#3D0A1F] hover:bg-white"
            }
          `}
        >
          <Menu size={18} />
        </button>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`
            w-9 h-9 rounded-lg flex items-center justify-center
            transition-all duration-200
            ${isDark
              ? "bg-[#D3D3D3] border border-[#5C1A30] text-[#5C1A30] hover:bg-white"
              : "bg-[#D3D3D3] border border-[#753141] text-[#3D0A1F] hover:bg-white"
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
              w-9 h-9 rounded-lg flex items-center justify-center relative
              transition-all duration-200
              ${isDark
                ? "bg-[#D3D3D3] border border-[#5C1A30] text-[#5C1A30] hover:bg-white"
                : "bg-[#D3D3D3] border border-[#753141] text-[#3D0A1F] hover:bg-white"
              }
            `}
          >
            <Bell size={16} />
            {DEMO_NOTIFICATIONS.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8B1A2E] text-white text-[9px] font-bold flex items-center justify-center">
                {DEMO_NOTIFICATIONS.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className={`
                absolute right-0 top-11 w-72 lg:w-80 rounded-xl shadow-2xl z-50
                transition-colors duration-300
                ${isDark
                  ? "bg-[#5C1A30] border border-[#5C1A30] text-[#F5ECD7]"
                  : "bg-[#FFFFFF] border border-[#ffffff] text-[#591727]"
                }
              `}
            >
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-semibold"
                  style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}>
                  notification
                </span>
              </div>

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

              <div className="px-4 flex flex-col gap-3 pb-3">
                {DEMO_NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl p-3 ${isDark ? "bg-[#3D0A1F]" : "bg-[#EBD9B8]"}`}
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

              <div
                className={`
                  px-4 py-3 text-center text-xs font-semibold cursor-pointer border-t transition-colors
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
        

        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#D3D3D3] border border-[#753141] shrink-0">
          {userImage ? (
            <Image
              src="/images/docterpc.png"
              alt={userName}
              width={39}
              height={39}
              className="object-cover w-full h-full scale-125"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#7A3048] text-[#F5ECD7] text-xs font-bold">
              {initials}
            </div>
          )}
        </div>

       

      </div>
    </header>
  );
}