"use client";

import { useMemo, useState } from "react";
import type { AnalyticsPeriod, ChartPoint } from "@/utils/analyticsData";
import { AnalyticsFilterPill } from "./AnalyticsFilterPill";
import {
  buildYAxisTicks,
  niceChartMax,
  smoothCurvePath,
  snapPointsToCurve,
} from "./chartUtils";

type TotalVisitorsChartProps = {
  data: Record<AnalyticsPeriod, ChartPoint[]>;
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
};

export function TotalVisitorsChart({
  data,
  isDark,
  card,
  cardBorder,
  text1,
  text2,
}: TotalVisitorsChartProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("Today");
  const points = data[period]?.length ? data[period] : [{ t: "-", v: 0 }];

  const maxV = useMemo(
    () => niceChartMax(points.map((p) => p.v)),
    [points]
  );
  const yTicks = useMemo(() => buildYAxisTicks(maxV), [maxV]);

  const W = 880;
  const H = 220;
  const padL = 34;
  const padR = 10;
  const padT = 14;
  const padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const baseY = padT + chartH;
  const denom = Math.max(points.length - 1, 1);

  const toX = (i: number) => padL + (i / denom) * chartW;
  const toY = (v: number) => padT + chartH - (v / maxV) * chartH;

  const pts = useMemo(
    () => points.map((p, i) => ({ x: toX(i), y: toY(p.v) })),
    [points, maxV, chartH, padL, chartW, denom]
  );
  const dotPts = useMemo(() => snapPointsToCurve(pts, 0.35), [pts]);
  const linePath = smoothCurvePath(pts, 0.35, padT);
  const areaPath =
    linePath +
    ` L ${toX(points.length - 1)} ${baseY}` +
    ` L ${toX(0)} ${baseY} Z`;

  const lineColor = isDark ? "#8B1A2E" : "#591727";
  const gradTop = isDark ? "#8B1A2E" : "#591727";

  return (
    <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: text1 }}>
          Total Bookings
        </h2>
        <AnalyticsFilterPill
          value={period}
          onChange={setPeriod}
          isDark={isDark}
          card={card}
          text2={text2}
        />
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full max-w-full"
          style={{ minWidth: 280, height: "auto" }}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Bookings chart for ${period}`}
        >
          <defs>
            <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradTop} stopOpacity="0.45" />
              <stop offset="60%" stopColor={gradTop} stopOpacity="0.10" />
              <stop offset="100%" stopColor={gradTop} stopOpacity="0.00" />
            </linearGradient>
            <clipPath id="visPlotClip">
              <rect x={padL} y={padT - 6} width={chartW} height={chartH + 6} />
            </clipPath>
          </defs>

          {pts.map((p, i) => (
            <line
              key={i}
              x1={p.x}
              y1={padT}
              x2={p.x}
              y2={baseY}
              stroke={isDark ? "#5C2A3A" : "#E8D8C0"}
              strokeWidth="0.5"
            />
          ))}

          <g clipPath="url(#visPlotClip)">
            <path d={areaPath} fill="url(#visGrad)" />
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {yTicks.map((v, i) => {
            const y = toY(v);
            return (
              <g key={`y-tick-${i}-${v}`}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  stroke={isDark ? "#5C2A3A" : "#D9C9A8"}
                  strokeWidth="0.8"
                  strokeDasharray="4 5"
                />
                <text x={padL - 6} y={y + 4} fontSize="9" fill={text2} textAnchor="end">
                  {v}
                </text>
              </g>
            );
          })}

          {dotPts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="6" fill={lineColor} fillOpacity="0.15" />
              <circle cx={p.x} cy={p.y} r="3.5" fill={lineColor} stroke={card} strokeWidth="1.8" />
            </g>
          ))}

          {points.map((p, i) => (
            <text key={i} x={toX(i)} y={H - 8} fontSize="9" fill={text2} textAnchor="middle">
              {p.t}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex items-center gap-1.5 mt-1 pl-8">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="4.5" stroke={lineColor} strokeWidth="1.5" fill="none" />
          <circle cx="6" cy="6" r="2" fill={lineColor} />
        </svg>
        <span className="text-xs" style={{ color: text2 }}>
          Bookings created
        </span>
      </div>
    </div>
  );
}
