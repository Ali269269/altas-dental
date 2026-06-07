"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getToken } from "@/utils/auth";
import { apiUrl } from "@/utils/api";
import {
  formatAppointmentDateLabels,
  getTodayAnchorDate,
} from "@/utils/appointmentDateLabels";
import type { CalendarEvent } from "@/utils/appointmentsData";
import { DEFAULT_APPOINTMENTS_OVERVIEW } from "@/utils/appointmentsData";

const MONTH_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function shiftMonthAnchor(anchor: string, direction: -1 | 1): string {
  const [y, m, d] = anchor.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() + direction);
  date.setDate(1);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

function eventColor(color: string) {
  switch (color) {
    case "blue":
      return "bg-blue-100 border-l-2 border-blue-400 text-blue-700";
    case "red":
      return "bg-red-50 border-l-2 border-red-400 text-red-700";
    case "gold":
      return "bg-yellow-50 border-l-2 border-yellow-500 text-yellow-700";
    case "green":
      return "bg-green-50 border-l-2 border-green-500 text-green-700";
    default:
      return "bg-gray-100 border-l-2 border-gray-400 text-gray-700";
  }
}

type MonthGridProps = {
  offset: number;
  daysInMonth: number;
  today: number | null;
  events: Record<string, CalendarEvent[]>;
  cardInner: string;
  cardBorder: string;
  text1: string;
  text2: string;
  isDark: boolean;
  onSelectAppointment: (id: string) => void;
};

function MonthGrid({
  offset,
  daysInMonth,
  today,
  events,
  cardInner,
  cardBorder,
  text1,
  text2,
  isDark,
  onSelectAppointment,
}: MonthGridProps) {
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[420px]">
        <div className="grid grid-cols-7 gap-px mb-1">
          {MONTH_DAYS.map((d) => (
            <div key={d} className="text-[11px] font-semibold text-center py-2" style={{ color: text2 }}>
              {d}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-px">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-px">
              {week.map((day, di) => {
                const dayEvents = day ? events[String(day)] || [] : [];
                const isToday = day !== null && today !== null && day === today;
                return (
                  <div
                    key={di}
                    className={`min-h-[70px] sm:min-h-[80px] p-1 sm:p-1.5 rounded-lg border transition-colors ${cardBorder}`}
                    style={{ backgroundColor: day ? cardInner : "transparent" }}
                  >
                    {day && (
                      <>
                        <div
                          className="text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1 numeric-font"
                          style={{
                            backgroundColor: isToday
                              ? isDark
                                ? "#8B1A2E"
                                : "#3D0A1F"
                              : "transparent",
                            color: isToday ? "#F5ECD7" : text1,
                          }}
                        >
                          {day}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {dayEvents.map((ev, ei) => (
                            <button
                              key={ev.appointmentId || `${day}-${ei}-${ev.label}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectAppointment(ev.appointmentId);
                              }}
                              className={`text-left w-full cursor-pointer text-[10px] sm:text-[11px] px-1 py-0.5 rounded truncate ${eventColor(ev.color)} hover:opacity-90 hover:ring-1 hover:ring-[#591727]/40`}
                              title={`${ev.patientName} — ${ev.status}`}
                            >
                              {ev.label || `${ev.time} · ${ev.patientName}`}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type UpcomingMonthCalendarProps = {
  cardInner: string;
  cardBorder: string;
  cardBg: string;
  text1: string;
  text2: string;
  isDark: boolean;
  onSelectAppointment: (id: string) => void;
};

export function UpcomingMonthCalendar({
  cardInner,
  cardBorder,
  cardBg,
  text1,
  text2,
  isDark,
  onSelectAppointment,
}: UpcomingMonthCalendarProps) {
  const [anchorDate, setAnchorDate] = useState(getTodayAnchorDate);
  const [monthCalendar, setMonthCalendar] = useState(DEFAULT_APPOINTMENTS_OVERVIEW.monthCalendar);
  const [monthLabel, setMonthLabel] = useState(
    () => formatAppointmentDateLabels(getTodayAnchorDate()).month
  );
  const [loading, setLoading] = useState(true);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const fetchMonthCalendar = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: anchorDate,
        view: "month",
        page: "1",
        limit: "12",
      });

      const response = await fetch(
        apiUrl(`/api/statistics/appointments-overview?${params.toString()}`),
        {
          headers: authHeaders(),
          cache: "no-store",
        }
      );

      if (response.ok) {
        const json = await response.json();
        if (json.data?.monthCalendar) {
          setMonthCalendar(json.data.monthCalendar);
        }
        setMonthLabel(
          json.data?.dateLabels?.month ?? formatAppointmentDateLabels(anchorDate).month
        );
      }
    } catch (error) {
      console.error("Failed to fetch dashboard month calendar:", error);
    } finally {
      setLoading(false);
    }
  }, [anchorDate]);

  useEffect(() => {
    fetchMonthCalendar();
  }, [fetchMonthCalendar]);

  const navigateMonth = (direction: -1 | 1) => {
    setAnchorDate((prev) => shiftMonthAnchor(prev, direction));
  };

  const openDatePicker = () => {
    const picker = datePickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
    } else {
      picker.click();
    }
  };

  const goToToday = () => {
    setAnchorDate(getTodayAnchorDate());
  };

  const eventCount = Object.values(monthCalendar.events).reduce(
    (sum, dayEvents) => sum + dayEvents.length,
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cardBorder}`}
        style={{ backgroundColor: cardBg }}
      >
        <button
          type="button"
          onClick={openDatePicker}
          className="shrink-0"
          aria-label="Select month"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDark ? "#711C31" : "#591727"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <input
          ref={datePickerRef}
          type="date"
          value={anchorDate}
          onChange={(e) => {
            if (e.target.value) setAnchorDate(e.target.value);
          }}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: text2 }}>
            Month
          </div>
          <div className="text-xs sm:text-sm font-semibold truncate" style={{ color: text1 }}>
            {monthLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={goToToday}
          className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-transparent hover:bg-black/5 shrink-0"
          style={{ color: text2 }}
        >
          Today
        </button>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-black/5"
            style={{ color: text2 }}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-black/5"
            style={{ color: text2 }}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 italic text-sm" style={{ color: text2 }}>
          Loading calendar...
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold" style={{ color: text2 }}>
              {eventCount} appointment{eventCount !== 1 ? "s" : ""} this month
            </span>
          </div>
          <MonthGrid
            offset={monthCalendar.offset}
            daysInMonth={monthCalendar.daysInMonth}
            today={monthCalendar.today}
            events={monthCalendar.events}
            cardInner={cardInner}
            cardBorder={cardBorder}
            text1={text1}
            text2={text2}
            isDark={isDark}
            onSelectAppointment={onSelectAppointment}
          />
        </>
      )}
    </div>
  );
}
