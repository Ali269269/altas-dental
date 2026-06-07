"use client";

import { useMemo, useState } from "react";
import type { AnalyticsPeriod, ConversionSlice } from "@/utils/analyticsData";
import { AnalyticsFilterPill } from "./AnalyticsFilterPill";

type ConversionRateChartProps = {
  data: Record<AnalyticsPeriod, ConversionSlice>;
  changePercent: number;
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
};

export function ConversionRateChart({
  data,
  changePercent,
  isDark,
  card,
  cardBorder,
  text1,
  text2,
}: ConversionRateChartProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("Today");
  const slice = data[period] ?? { visitors: 0, clicks: 0 };
  const { visitors, clicks } = slice;

  const { total, visitPct, clickPct, visitFrac, clickFrac, centerPct } = useMemo(() => {
    const sum = visitors + clicks;
    if (sum === 0) {
      return {
        total: 0,
        visitPct: "0.00",
        clickPct: "0.00",
        visitFrac: 0.5,
        clickFrac: 0.5,
        centerPct: 0,
      };
    }
    return {
      total: sum,
      visitPct: ((visitors / sum) * 100).toFixed(2),
      clickPct: ((clicks / sum) * 100).toFixed(2),
      visitFrac: visitors / sum,
      clickFrac: clicks / sum,
      centerPct: Math.round((clicks / sum) * 100),
    };
  }, [visitors, clicks]);

  const cx = 110;
  const cy = 100;
  const r = 55;
  const sw = 35;
  const circ = 2 * Math.PI * r;

  const visColor = isDark ? "#8B1A2E" : "#591727";
  const clickColor = isDark ? "#d0baa3" : "#D3D3D3";
  const valueColor = isDark ? "#591727" : "#591727";

  const trendLabel =
    changePercent >= 0
      ? `+${changePercent}% vs yesterday`
      : `${changePercent}% vs yesterday`;

  return (
    <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold" style={{ color: text1 }}>
          Conversion Rate
        </h2>
        <AnalyticsFilterPill
          value={period}
          onChange={setPeriod}
          isDark={isDark}
          card={card}
          text2={text2}
        />
      </div>

      <svg
        viewBox="0 0 220 200"
        className="w-full max-w-xs mx-auto"
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        role="img"
        aria-label={`Conversion rate chart for ${period}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={visColor}
          strokeWidth={sw}
          strokeDasharray={`${visitFrac * circ} ${circ}`}
          strokeDashoffset="0"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={clickColor}
          strokeWidth={sw}
          strokeDasharray={`${clickFrac * circ} ${circ}`}
          strokeDashoffset={`-${visitFrac * circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text x={cx} y={cy - 6} fontSize="18" fill={text1} textAnchor="middle" fontWeight="bold">
          {centerPct}%
        </text>
        <text x={cx} y={cy + 10} fontSize="7.5" fill={text2} textAnchor="middle">
          more than yesterday
        </text>
        <line
          x1={cx - r * 0.58}
          y1={cy - r * 0.3}
          x2={cx - r * 1.4}
          y2={cy - r * 0.3}
          stroke={text2}
          strokeWidth="0.8"
        />
        <text x={cx - r * 1.42} y={cy - r * 0.38} fontSize="10" fill={text2} textAnchor="end">
          Clicks
        </text>
        <text x={cx - r * 1.42} y={cy - r * 0.18} fontSize="10" textAnchor="end">
          <tspan fill={valueColor} fontWeight="bold">
            {clicks}
          </tspan>
          <tspan fill={text2} dx="1">
            {clickPct}%
          </tspan>
        </text>
        <line
          x1={cx + r * 0.75}
          y1={cy + r * 0.35}
          x2={cx + r * 1.4}
          y2={cy + r * 0.35}
          stroke={text2}
          strokeWidth="0.8"
        />
        <text x={cx + r * 1.42} y={cy + r * 0.27} fontSize="10" fill={text2} textAnchor="start">
          Visitors
        </text>
        <text x={cx + r * 1.42} y={cy + r * 0.45} fontSize="10" textAnchor="start">
          <tspan fill={valueColor} fontWeight="bold">
            {visitors}
          </tspan>
          <tspan fill={text2} dx="3">
            {visitPct}%
          </tspan>
        </text>
      </svg>

      <div className="flex items-center justify-center gap-6 mt-1">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: visColor }}
          />
          <span className="text-xs" style={{ color: "#711C31" }}>
            Visitors
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: clickColor }}
          />
          <span className="text-xs" style={{ color: "#711C31" }}>
            Clicks
          </span>
        </div>
      </div>

      <div
        className="flex gap-8 mt-4 pt-4"
        style={{ borderTop: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}
      >
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7" cy="6" r="3" stroke={text2} strokeWidth="1.2" />
            <path
              d="M1 16c0-3.3 2.7-6 6-6s6 2.7 6 6"
              stroke={text2}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="13" cy="6" r="2.5" stroke={text2} strokeWidth="1.2" />
          </svg>
          <div>
            <div className="text-xs font-semibold" style={{ color: "#711C31" }}>
              Total Users
            </div>
            <div className="text-sm font-bold" style={{ color: text1 }}>
              {total.toLocaleString()}
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold" style={{ color: "#711C31" }}>
            Total Clicks
          </div>
          <div className="text-sm font-bold" style={{ color: text1 }}>
            {clicks.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
