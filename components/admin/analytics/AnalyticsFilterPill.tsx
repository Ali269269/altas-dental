"use client";

import { useState } from "react";
import type { AnalyticsPeriod } from "@/utils/analyticsData";

type AnalyticsFilterPillProps = {
  value: AnalyticsPeriod;
  onChange: (value: AnalyticsPeriod) => void;
  options?: AnalyticsPeriod[];
  isDark: boolean;
  card: string;
  text2: string;
};

export function AnalyticsFilterPill({
  value,
  onChange,
  options = ["Today", "Week", "Month"],
  isDark,
  card,
  text2,
}: AnalyticsFilterPillProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" style={{ zIndex: 50 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold"
        style={{
          backgroundColor: isDark ? "#8B1A2E" : "#591727",
          color: "#F5ECD7",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="#F5ECD7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 rounded-xl shadow-xl py-1 min-w-[100px]"
          style={{
            top: "calc(100% + 6px)",
            backgroundColor: card,
            border: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}`,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:opacity-80"
              style={{
                color: opt === value ? "#591727" : text2,
                fontWeight: opt === value ? 700 : 400,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
