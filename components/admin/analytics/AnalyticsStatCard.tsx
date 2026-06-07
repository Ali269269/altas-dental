"use client";

import type { AnalyticsSummary } from "@/utils/analyticsData";

type AnalyticsStatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  badge?: string;
  isDark: boolean;
  cardBorder: string;
};

export function AnalyticsStatCard({
  title,
  value,
  subtitle,
  badge,
  isDark,
  cardBorder,
}: AnalyticsStatCardProps) {
  const text1 = "#591727";
  const text2 = isDark ? "#591727" : "#7A6040";

  return (
    <div
      className={`an-stat-card relative rounded-2xl p-6 border ${cardBorder}`}
      style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-md" style={{ color: "#591727" }}>
          {title}
        </p>
        {badge ? (
          <span className="text-[13px] font-semibold px-4 py-1 rounded-full bg-[#84535f] text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="text-4xl font-bold" style={{ color: text1 }}>
        {value}
      </span>
      <p className="text-xs mt-1" style={{ color: text2 }}>
        {subtitle}
      </p>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
        <div
          className="h-full w-full"
          style={{
            backgroundColor: isDark ? "#c9a898" : "#D3D3D3",
            borderTopLeftRadius: "9999px",
            borderBottomLeftRadius: "9999px",
            boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)",
          }}
        />
      </div>
    </div>
  );
}

export function summaryToStatCards(summary: AnalyticsSummary) {
  return {
    visitors: {
      title: "Total Bookings",
      value: summary.totalVisitorsToday,
      subtitle: "Today",
      badge: summary.changeLabel,
    },
    conversion: {
      title: "Conversion rate",
      value: `${summary.conversionRatePercent}%`,
      subtitle: summary.conversionSubtitle,
    },
  };
}
