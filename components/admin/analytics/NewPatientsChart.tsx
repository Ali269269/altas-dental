"use client";

import { useMemo, useState } from "react";
import type { AnalyticsPeriod, BarPoint } from "@/utils/analyticsData";
import { AnalyticsFilterPill } from "./AnalyticsFilterPill";
import { buildYAxisTicks, niceChartMax } from "./chartUtils";

type NewPatientsChartProps = {
  data: Record<AnalyticsPeriod, BarPoint[]>;
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
};

export function NewPatientsChart({
  data,
  isDark,
  card,
  cardBorder,
  text1,
  text2,
}: NewPatientsChartProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("Week");
  const chartData = data[period]?.length ? data[period] : [{ label: "-", v: 0 }];

  const maxVal = useMemo(
    () => niceChartMax(chartData.map((d) => d.v)),
    [chartData]
  );
  const yTicks = useMemo(() => buildYAxisTicks(maxVal), [maxVal]);

  const chartH = 180;
  const barW = 24;
  const depth = 2;
  const groupGap = chartData.length > 7 ? 4 : 28;
  const groupW = barW + groupGap;
  const padL = 36;
  const chartTop = 16;
  const baseY = chartTop + chartH;
  const totalW = padL + chartData.length * groupW + depth + 10;
  const totalH = chartH + chartTop + 36;

  const faceLight = isDark ? "#7c2f41" : "#aa8991";
  const faceDark = isDark ? "#681428" : "#84535f";
  const faceTop = isDark ? "#681428" : "#591727";
  const bgFaceL = isDark ? "#5C2A3A" : "#efe8ea";
  const bgFaceR = isDark ? "#4A1F2E" : "#e8dfe1";
  const bgFaceTop = isDark ? "#5C2A3A" : "#ded1d4";

  return (
    <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: text1 }}>
          New patients
        </h2>
        <AnalyticsFilterPill
          value={period}
          onChange={setPeriod}
          isDark={isDark}
          card={card}
          text2={text2}
        />
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          style={{ minWidth: 280, width: "100%" }}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`New patients chart for ${period}`}
        >
          {yTicks.map((v, i) => {
            const y = baseY - (v / maxVal) * chartH;
            return (
              <g key={`y-tick-${i}-${v}`}>
                <line
                  x1={padL}
                  y1={y}
                  x2={totalW}
                  y2={y}
                  stroke={isDark ? "#5C2A3A" : "#D9C9A8"}
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <text x={padL - 6} y={y + 4} fontSize="8.5" fill={text2} textAnchor="end">
                  {v}
                </text>
              </g>
            );
          })}

          {chartData.map((d, i) => {
            const cx = padL + i * groupW + barW / 2;
            const halfW = barW / 2;
            const bH = (d.v / maxVal) * chartH;
            const bY = baseY - bH;
            const ct = baseY - chartH;
            const backL = cx - halfW;
            const backR = cx + halfW;
            const backTopY = bY - depth;
            const backShadowTopY = ct - depth;

            return (
              <g key={d.label}>
                <polygon
                  points={`${cx},${ct} ${backR},${backShadowTopY} ${backR},${baseY} ${cx},${baseY}`}
                  fill={bgFaceR}
                />
                <polygon
                  points={`${backL},${backShadowTopY} ${cx},${ct} ${cx},${baseY} ${backL},${baseY}`}
                  fill={bgFaceL}
                />
                <polygon
                  points={`${backL},${backShadowTopY} ${cx},${ct - depth / 8} ${backR},${backShadowTopY} ${cx},${ct - depth * 2}`}
                  fill={bgFaceTop}
                />
                <polygon
                  points={`${backL},${backTopY} ${cx},${bY} ${cx},${baseY} ${backL},${baseY}`}
                  fill={faceLight}
                />
                <polygon
                  points={`${cx},${bY} ${backR},${backTopY} ${backR},${baseY} ${cx},${baseY}`}
                  fill={faceDark}
                />
                <polygon
                  points={`${backL},${backTopY} ${cx},${bY - depth / 8} ${backR},${backTopY} ${cx},${bY - depth * 2}`}
                  fill={faceTop}
                />
                <text
                  x={cx}
                  y={bY - depth * 2 - 8}
                  fontSize="11"
                  fill={text1}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {d.v}
                </text>
              </g>
            );
          })}

          {chartData.map((d, i) => {
            const cx = padL + i * groupW + barW / 2;
            return (
              <text
                key={`lbl-${d.label}`}
                x={cx}
                y={baseY + 16}
                fontSize={chartData.length > 10 ? "7" : "9"}
                fill={text2}
                textAnchor="middle"
              >
                {d.label}
              </text>
            );
          })}

          <line
            x1={padL}
            y1={baseY}
            x2={totalW}
            y2={baseY}
            stroke={isDark ? "#5C2A3A" : "#D9C9A8"}
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="flex items-center gap-2 mt-1 pl-8">
        <span
          className="w-2.5 h-2.5 rounded-sm inline-block"
          style={{ backgroundColor: faceDark }}
        />
        <span className="text-xs" style={{ color: text2 }}>
          New patients this{" "}
          {period === "Today" ? "day" : period === "Week" ? "week" : "year"}
        </span>
      </div>
    </div>
  );
}
