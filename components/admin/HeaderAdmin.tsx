"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAdminProfile } from "@/context/AdminProfileContext";
import ProfileDetailsModal from "@/components/admin/ProfileDetailsModal";
import { Search, Bell, Sun, Moon, X, Menu } from "lucide-react";
import Image from "next/image";
import { getToken } from "@/utils/auth";
import { apiUrl } from "@/utils/api";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  timeAgo: string;
  details: {
    appointmentId: string | null;
    patientName: string;
    service: string;
    appointmentDate: string | null;
    appointmentTime: string;
    phone: string;
    email: string;
  };
}

const INFO_NOTIFICATION_TYPES = new Set([
  "NEWSLETTER_SUBSCRIPTION",
  "CONTACT_FORM_SUBMISSION",
]);

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function isAppointmentNotification(notification: NotificationItem) {
  return Boolean(
    notification.details.appointmentId &&
      (notification.type === "APPOINTMENT_BOOKED" ||
        notification.type === "APPOINTMENT_UPDATED")
  );
}

function notificationDisplayName(notification: NotificationItem) {
  return (
    notification.details.patientName ||
    notification.details.email ||
    notification.title
  );
}

function notificationSubtitle(notification: NotificationItem) {
  if (notification.type === "NEWSLETTER_SUBSCRIPTION") {
    return notification.message || "Newsletter subscription";
  }
  if (notification.type === "CONTACT_FORM_SUBMISSION") {
    return notification.message || "Contact form submission";
  }
  return notification.details.service || notification.message;
}

interface HeaderAdminProps {
  title: string;
  userImage?: string;
  userName?: string;
  onMenuClick?: () => void;
}

export default function HeaderAdmin({
  title,
  userImage,
  userName = "Admin",
  onMenuClick,
}: HeaderAdminProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { profile } = useAdminProfile();

  const [notifOpen, setNotifOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(apiUrl("/api/statistics/notifications?limit=15"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) return;

      const json = await response.json();
      const payload = json?.data;
      if (!payload) return;

      setNotifications(payload.notifications ?? []);
      setUnreadCount(Number(payload.unreadCount ?? 0));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const markOneAsRead = useCallback(
    async (id: string) => {
      const token = getToken();
      if (!token) return;

      removeNotification(id);

      try {
        await fetch(apiUrl(`/api/statistics/notifications/${id}/read`), {
          method: "PUT",
          headers: authHeaders(),
        });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        fetchNotifications();
      }
    },
    [fetchNotifications, removeNotification]
  );

  const confirmFromNotification = useCallback(
    async (notification: NotificationItem) => {
      const appointmentId = notification.details.appointmentId;
      if (!appointmentId) {
        await markOneAsRead(notification.id);
        return;
      }

      const token = getToken();
      if (!token) return;

      setActionLoadingId(notification.id);
      try {
        const response = await fetch(apiUrl(`/api/statistics/appointments/${appointmentId}`), {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ status: "CONFIRMED" }),
        });

        if (response.ok) {
          removeNotification(notification.id);
        } else {
          const err = await response.json().catch(() => ({}));
          window.alert(err.message || "Failed to confirm appointment.");
        }
      } catch (error) {
        console.error("Failed to confirm appointment notification:", error);
        window.alert("Failed to confirm appointment.");
      } finally {
        setActionLoadingId(null);
      }
    },
    [markOneAsRead, removeNotification]
  );

  const cancelFromNotification = useCallback(
    async (notification: NotificationItem) => {
      const appointmentId = notification.details.appointmentId;
      if (!appointmentId) return;

      const reason = window.prompt("Please provide a cancellation reason:");
      if (!reason?.trim()) {
        if (reason !== null) window.alert("Please provide a cancellation reason.");
        return;
      }

      const token = getToken();
      if (!token) return;

      setActionLoadingId(notification.id);
      try {
        const response = await fetch(apiUrl(`/api/statistics/appointments/${appointmentId}`), {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            status: "CANCELLED",
            cancellationReason: reason.trim(),
          }),
        });

        if (response.ok) {
          removeNotification(notification.id);
        } else {
          const err = await response.json().catch(() => ({}));
          window.alert(err.message || "Failed to cancel appointment.");
        }
      } catch (error) {
        console.error("Failed to cancel appointment notification:", error);
        window.alert("Failed to cancel appointment.");
      } finally {
        setActionLoadingId(null);
      }
    },
    [removeNotification]
  );

  const dismissInfoNotificationsOnClose = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setNotifications((prev) => {
      const toDismiss = prev.filter(
        (n) => !n.isRead && INFO_NOTIFICATION_TYPES.has(n.type)
      );
      if (toDismiss.length === 0) return prev;

      setUnreadCount((count) => Math.max(0, count - toDismiss.length));

      Promise.all(
        toDismiss.map((n) =>
          fetch(apiUrl(`/api/statistics/notifications/${n.id}/read`), {
            method: "PUT",
            headers: authHeaders(),
          })
        )
      ).catch((error) => {
        console.error("Failed to dismiss info notifications:", error);
        fetchNotifications();
      });

      return prev.filter((n) => !toDismiss.some((item) => item.id === n.id));
    });
  }, [fetchNotifications]);

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

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) await fetchNotifications();
    };

    load();
    const intervalId = window.setInterval(load, 5000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (!notifOpen) return;

    return () => {
      dismissInfoNotificationsOnClose();
    };
  }, [notifOpen, dismissInfoNotificationsOnClose]);

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
    <header className="fixed top-0 right-0 z-30 h-[72px] flex items-center justify-between px-4 lg:px-8 transition-all duration-300 left-0 lg:left-[285px] lg:rounded-l-2xl backdrop-blur-md bg-white/10 dark:bg-black/10">
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

      <div className="flex items-center gap-2 lg:gap-3">
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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8B1A2E] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
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
                  Notifications
                </span>
                <span className="w-5 h-5 rounded-full bg-[#8B1A2E] text-white text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              </div>

              <div className="px-4 flex flex-col gap-3 pb-3 max-h-[360px] overflow-y-auto">
                {notifications.length === 0 && (
                  <div className={`rounded-xl p-3 ${isDark ? "bg-[#3D0A1F]" : "bg-[#D3D3D3]"}`}>
                    <p className={`text-sm ${isDark ? "text-[#F5ECD7]" : "text-[#591727]"}`}>
                      No new notifications.
                    </p>
                  </div>
                )}

                {notifications.map((n) => {
                  const showActions = isAppointmentNotification(n);
                  const isLoading = actionLoadingId === n.id;
                  const isContact = n.type === "CONTACT_FORM_SUBMISSION";

                  return (
                  <div
                    key={n.id}
                    className={`rounded-xl p-3 ${isDark ? "bg-[#3D0A1F]" : "bg-[#D3D3D3]"} ${!n.isRead ? "ring-1 ring-[#8B1A2E]/60" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-sm font-semibold ${isDark ? "text-[#F5ECD7]" : "text-[#591727]"}`}
                        style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}
                      >
                        {notificationDisplayName(n)}
                      </span>
                      <span className={`text-xs shrink-0 ml-2 ${isDark ? "text-[#A07850]" : "text-[#7A6040]"}`}>
                        {n.timeAgo}
                      </span>
                    </div>
                    {isContact ? (
                      <div className="flex flex-col gap-1 mb-2.5">
                        <p className={`text-xs font-semibold ${isDark ? "text-[#A07850]" : "text-[#7A6040]"}`}>
                          Contact form submission
                        </p>
                        {n.details.email && (
                          <p className={`text-xs ${isDark ? "text-[#A07850]" : "text-[#7A6040]"}`}>
                            {n.details.email}
                          </p>
                        )}
                        <p
                          className={`text-xs whitespace-pre-wrap break-words line-clamp-4 ${isDark ? "text-[#F5ECD7]" : "text-[#591727]"}`}
                          title={n.message}
                        >
                          {n.message || "No message provided."}
                        </p>
                      </div>
                    ) : (
                      <p
                        className={`text-xs mb-2.5 line-clamp-3 ${isDark ? "text-[#A07850]" : "text-[#7A6040]"}`}
                        title={notificationSubtitle(n)}
                      >
                        {notificationSubtitle(n)}
                      </p>
                    )}
                    {showActions && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => cancelFromNotification(n)}
                          disabled={isLoading}
                          className="flex-1 py-1.5 rounded-lg bg-[#591727] text-[#F5ECD7] text-xs font-semibold hover:bg-[#5C1A30] transition-colors disabled:opacity-60"
                        >
                          {isLoading ? "..." : "Cancel"}
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmFromNotification(n)}
                          disabled={isLoading}
                          className={`
                            flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-60
                            ${isDark
                              ? "border-[#5C1A30] text-[#F5ECD7] hover:bg-[#5C1A30]"
                              : "border-[#591727] text-[#3D0A1F] hover:bg-[#CFCFCF]"
                            }
                          `}
                        >
                          {isLoading ? "..." : "Confirm"}
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })}
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

        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="w-10 h-10 rounded-lg overflow-hidden bg-[#D3D3D3] border border-[#753141] shrink-0 cursor-pointer transition-opacity hover:opacity-90"
          title="View profile details"
          aria-label="View profile details"
        >
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={40}
              height={40}
              unoptimized
              className="object-cover w-full h-full object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#7A3048] text-[#F5ECD7] text-xs font-bold">
              {initials}
            </div>
          )}
        </button>

        {showProfileModal && (
          <ProfileDetailsModal
            fullName={profile?.fullName || userName}
            professionalTitle={profile?.professionalTitle || ""}
            email={profile?.email || ""}
            phone={profile?.phone || ""}
            photoUrl={profile?.profilePhoto || userImage || ""}
            onClose={() => setShowProfileModal(false)}
            isDark={isDark}
          />
        )}
      </div>
    </header>
  );
}
