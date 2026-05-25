"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type FilterOption = "Today" | "Week" | "Month";

// ── Data ──────────────────────────────────────────────────────────────────────
const visitorsData: Record<FilterOption, { t: string; v: number }[]> = {
  Today: [
    { t: "00:00", v: 68 }, { t: "01:00", v: 20 }, { t: "03:00", v: 35 },
    { t: "05:00", v: 20 }, { t: "07:00", v: 42 }, { t: "09:00", v: 10 },
    { t: "11:00", v: 58 }, { t: "13:00", v: 18 }, { t: "16:00", v: 60 },
    { t: "18:00", v: 50 }, { t: "21:00", v: 90 }, { t: "24:00", v: 42 },
  ],
  Week: [
    { t: "Mon", v: 55 }, { t: "Tue", v: 72 }, { t: "Wed", v: 48 },
    { t: "Thu", v: 80 }, { t: "Fri", v: 65 }, { t: "Sat", v: 30 }, { t: "Sun", v: 50 },
  ],
  Month: [
    { t: "Jan", v: 40 }, { t: "Feb", v: 55 }, { t: "Mar", v: 70 },
    { t: "Apr", v: 60 }, { t: "May", v: 80 }, { t: "Jun", v: 75 },
    { t: "Jul", v: 90 }, { t: "Aug", v: 85 }, { t: "Sep", v: 65 },
    { t: "Oct", v: 72 }, { t: "Nov", v: 58 }, { t: "Dec", v: 78 },
  ],
};

const usersData: Record<FilterOption, { label: string; v: number }[]> = {
  Today: [
    { label: "6am", v: 30 }, { label: "9am", v: 55 }, { label: "12pm", v: 70 },
    { label: "3pm", v: 45 }, { label: "6pm", v: 60 }, { label: "9pm", v: 38 }, { label: "12am", v: 25 },
  ],
  Week: [
    { label: "Mon", v: 56 }, { label: "Tue", v: 64 }, { label: "Wed", v: 76 },
    { label: "Thu", v: 78 }, { label: "Fri", v: 70 }, { label: "Sat", v: 37 }, { label: "Sun", v: 37 },
  ],
  Month: [
    { label: "Jan", v: 45 }, { label: "Feb", v: 60 }, { label: "Mar", v: 55 },
    { label: "Apr", v: 70 }, { label: "May", v: 80 }, { label: "Jun", v: 65 },
    { label: "Jul", v: 75 }, { label: "Aug", v: 85 }, { label: "Sep", v: 60 },
    { label: "Oct", v: 70 }, { label: "Nov", v: 50 }, { label: "Dec", v: 65 },
  ],
};

const convData: Record<FilterOption, { visitors: number; clicks: number }> = {
  Today: { visitors: 80, clicks: 41 },
  Week:  { visitors: 320, clicks: 164 },
  Month: { visitors: 1234, clicks: 786 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function smoothCurvePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const tension = 0.4;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// ── Filter Pill ───────────────────────────────────────────────────────────────
function FilterPill({
  value, onChange, options, isDark, card, text2,
}: {
  value: FilterOption; onChange: (v: FilterOption) => void;
  options: FilterOption[]; isDark: boolean; card: string; text2: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" style={{ zIndex: 50 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold"
        style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727", color: "#F5ECD7" }}
      >
        {value}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <path d="M1 1L5 5L9 1" stroke="#F5ECD7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 rounded-xl shadow-xl py-1 min-w-[100px]"
          style={{ top: "calc(100% + 6px)", backgroundColor: card, border: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}
        >
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: opt === value ? "#591727" : text2, fontWeight: opt === value ? 700 : 400 }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 1. Total Visitors ─────────────────────────────────────────────────────────
function TotalVisitorsChart({
  isDark, card, cardBorder, cardInner, text1, text2,
}: {
  isDark: boolean; card: string; cardBorder: string; cardInner: string; text1: string; text2: string;
}) {
  const [period, setPeriod] = useState<FilterOption>("Today");
  const points = visitorsData[period];

  const W = 880, H = 220, padL = 34, padR = 10, padT = 14, padB = 30;
  const maxV = 100;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const baseY  = padT + chartH;

  const toX = (i: number) => padL + (i / (points.length - 1)) * chartW;
  const toY = (v: number) => padT + chartH - (v / maxV) * chartH;

  const pts      = points.map((p, i) => ({ x: toX(i), y: toY(p.v) }));
  const linePath = smoothCurvePath(pts);
  const areaPath = linePath
    + ` L ${toX(points.length - 1)} ${baseY}`
    + ` L ${toX(0)} ${baseY} Z`;

  const lineColor = isDark ? "#8B1A2E" : "#591727";
  const gradTop   = isDark ? "#8B1A2E" : "#591727";

  return (
    <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: text1 }}>Total Visitors</h2>
        <FilterPill value={period} onChange={setPeriod} options={["Today","Week","Month"]} isDark={isDark} card={card} text2={text2}/>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 320, width: "100%" }} preserveAspectRatio="xMidYMid meet" overflow="visible">
          <defs>
            <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={gradTop} stopOpacity="0.45"/>
              <stop offset="60%"  stopColor={gradTop} stopOpacity="0.10"/>
              <stop offset="100%" stopColor={gradTop} stopOpacity="0.00"/>
            </linearGradient>
            <clipPath id="visClip">
              <rect x={padL} y={padT} width={chartW} height={chartH + 1}/>
            </clipPath>
          </defs>

          {[0, 20, 40, 60, 80, 100].map(v => {
            const y = toY(v);
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={W - padR} y2={y}
                  stroke={isDark ? "#5C2A3A" : "#D9C9A8"} strokeWidth="0.8" strokeDasharray="4 5"/>
                <text x={padL - 6} y={y + 4} fontSize="9" fill={text2} textAnchor="end">{v}</text>
              </g>
            );
          })}

          {pts.map((p, i) => (
            <line key={i} x1={p.x} y1={padT} x2={p.x} y2={baseY}
              stroke={isDark ? "#5C2A3A" : "#E8D8C0"} strokeWidth="0.5"/>
          ))}

          <path d={areaPath} fill="url(#visGrad)" clipPath="url(#visClip)"/>
          <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"/>

          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="6" fill={lineColor} fillOpacity="0.15"/>
              <circle cx={p.x} cy={p.y} r="3.5" fill={lineColor} stroke={card} strokeWidth="1.8"/>
            </g>
          ))}

          {points.map((p, i) => (
            <text key={i} x={toX(i)} y={H - 8} fontSize="9" fill={text2} textAnchor="middle">{p.t}</text>
          ))}
        </svg>
      </div>

      <div className="flex items-center gap-1.5 mt-1 pl-8">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="4.5" stroke={lineColor} strokeWidth="1.5" fill="none"/>
          <circle cx="6" cy="6" r="2" fill={lineColor}/>
        </svg>
        <span className="text-xs" style={{ color: text2 }}>Visitors</span>
      </div>
    </div>
  );
}

// ── 2. Users This Week ────────────────────────────────────────────────────────
function UsersThisWeekChart({
  isDark, card, cardBorder, text1, text2,
}: {
  isDark: boolean; card: string; cardBorder: string; text1: string; text2: string;
}) {
  const [period, setPeriod] = useState<FilterOption>("Week");
  const data = usersData[period];

  const chartH = 180, barW = 24, depth = 2;
  const groupGap = data.length > 7 ? 4 : 28;
  const groupW   = barW + groupGap;
  const padL = 36, chartTop = 16;
  const baseY  = chartTop + chartH;
  const totalW = padL + data.length * groupW + depth + 10;
  const totalH = chartH + chartTop + 36;
  const maxVal = 100;

  const faceLight  = isDark ? "#7c2f41" : "#aa8991";
  const faceDark   = isDark ? "#681428" : "#84535f";
  const faceTop    = isDark ? "#681428" : "#591727";
  const bgFaceL    = isDark ? "#5C2A3A" : "#efe8ea";
  const bgFaceR    = isDark ? "#4A1F2E" : "#e8dfe1";
  const bgFaceTop  = isDark ? "#5C2A3A" : "#ded1d4";

  return (
    <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: text1 }}>Users this week</h2>
        <FilterPill value={period} onChange={setPeriod} options={["Today","Week","Month"]} isDark={isDark} card={card} text2={text2}/>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          style={{ minWidth: 280, width: "100%" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {[0, 20, 40, 60, 80, 100].map(v => {
            const y = baseY - (v / maxVal) * chartH;
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={totalW} y2={y}
                  stroke={isDark ? "#5C2A3A" : "#D9C9A8"} strokeWidth="0.8" strokeDasharray="3 3"/>
                <text x={padL - 6} y={y + 4} fontSize="8.5" fill={text2} textAnchor="end">{v}</text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const cx    = padL + i * groupW + barW / 2;
            const halfW = barW / 2;
            const bH    = (d.v / maxVal) * chartH;
            const bY    = baseY - bH;
            const ct    = baseY - chartH;
            const backL          = cx - halfW;
            const backR          = cx + halfW;
            const backTopY       = bY - depth;
            const backShadowTopY = ct - depth;

            return (
              <g key={d.label}>
                <polygon points={`${cx},${ct} ${backR},${backShadowTopY} ${backR},${baseY} ${cx},${baseY}`} fill={bgFaceR}/>
                <polygon points={`${backL},${backShadowTopY} ${cx},${ct} ${cx},${baseY} ${backL},${baseY}`} fill={bgFaceL}/>
                <polygon points={`${backL},${backShadowTopY} ${cx},${ct - depth / 8} ${backR},${backShadowTopY} ${cx},${ct - depth * 2}`} fill={bgFaceTop}/>
                <polygon points={`${backL},${backTopY} ${cx},${bY} ${cx},${baseY} ${backL},${baseY}`} fill={faceLight}/>
                <polygon points={`${cx},${bY} ${backR},${backTopY} ${backR},${baseY} ${cx},${baseY}`} fill={faceDark}/>
                <polygon points={`${backL},${backTopY} ${cx},${bY - depth / 8} ${backR},${backTopY} ${cx},${bY - depth * 2}`} fill={faceTop}/>
                <text x={cx} y={bY - depth * 2 - 8} fontSize="11" fill={text1} textAnchor="middle" fontWeight="bold">{d.v}</text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const cx = padL + i * groupW + barW / 2;
            return (
              <text key={`lbl-${d.label}`} x={cx} y={baseY + 16}
                fontSize={data.length > 10 ? "7" : "9"} fill={text2} textAnchor="middle">
                {d.label}
              </text>
            );
          })}

          <line x1={padL} y1={baseY} x2={totalW} y2={baseY}
            stroke={isDark ? "#5C2A3A" : "#D9C9A8"} strokeWidth="1"/>
        </svg>
      </div>

      <div className="flex items-center gap-2 mt-1 pl-8">
        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: faceDark }}/>
        <span className="text-xs" style={{ color: text2 }}>
          Total Users This {period === "Today" ? "Day" : period === "Week" ? "Week" : "Month"}
        </span>
      </div>
    </div>
  );
}

// ── 3. Conversion Rate ────────────────────────────────────────────────────────
function ConversionRateChart({
  isDark, card, cardBorder, text1, text2,
}: {
  isDark: boolean; card: string; cardBorder: string; text1: string; text2: string;
}) {
  const [period, setPeriod] = useState<FilterOption>("Today");
  const { visitors, clicks } = convData[period];
  const total      = visitors + clicks;
  const visitPct   = ((visitors / total) * 100).toFixed(2);
  const clickPct   = ((clicks / total) * 100).toFixed(2);
  const visitFrac  = visitors / total;
  const clickFrac  = clicks / total;

  const cx = 110, cy = 100, r = 55, sw = 35;
  const circ = 2 * Math.PI * r;

  const visColor   = isDark ? "#8B1A2E" : "#591727";
  const clickColor = isDark ? "#d0baa3" : "#D3D3D3";

  return (
    <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold" style={{ color: text1 }}>Conversion Rate</h2>
        <FilterPill value={period} onChange={setPeriod} options={["Today","Week","Month"]} isDark={isDark} card={card} text2={text2}/>
      </div>

      <svg viewBox="0 0 220 200" className="w-full max-w-xs mx-auto" preserveAspectRatio="xMidYMid meet">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={visColor} strokeWidth={sw}
          strokeDasharray={`${visitFrac * circ} ${circ}`} strokeDashoffset="0"
          transform={`rotate(-90 ${cx} ${cy})`}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={clickColor} strokeWidth={sw}
          strokeDasharray={`${clickFrac * circ} ${circ}`} strokeDashoffset={`-${visitFrac * circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}/>
        <text x={cx} y={cy - 6} fontSize="18" fill={text1} textAnchor="middle" fontWeight="bold">
          {Math.round((visitors / total) * 100)}%
        </text>
        <text x={cx} y={cy + 10} fontSize="7.5" fill={text2} textAnchor="middle">more than yesterday</text>
        <line x1={cx - r * 0.58} y1={cy - r * 0.3} x2={cx - r * 1.4} y2={cy - r * 0.3} stroke={text2} strokeWidth="0.8"/>
        <text x={cx - r * 1.42} y={cy - r * 0.38} fontSize="10" fill={text2} textAnchor="end">Clicks</text>
        <text x={cx - r * 1.42} y={cy - r * 0.18} fontSize="10" textAnchor="end">
          <tspan fill={clickColor} fontWeight="bold">{clicks}</tspan>
          <tspan fill={text2} dx="1">{clickPct}%</tspan>
        </text>
        <line x1={cx + r * 0.75} y1={cy + r * 0.35} x2={cx + r * 1.4} y2={cy + r * 0.35} stroke={text2} strokeWidth="0.8"/>
        <text x={cx + r * 1.42} y={cy + r * 0.27} fontSize="10" fill={text2} textAnchor="start">Visitors</text>
        <text x={cx + r * 1.42} y={cy + r * 0.45} fontSize="10" textAnchor="start">
          <tspan fill={visColor} fontWeight="bold">{visitors}</tspan>
          <tspan fill={text2} dx="3">{visitPct}%</tspan>
        </text>
      </svg>

      <div className="flex items-center justify-center gap-6 mt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: visColor }}/>
          <span className="text-xs" style={{ color: "#711C31" }}>Visitors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: clickColor }}/>
          <span className="text-xs" style={{ color: "#711C31" }}>Clicks</span>
        </div>
      </div>

      <div className="flex gap-8 mt-4 pt-4" style={{ borderTop: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}>
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7" cy="6" r="3" stroke={text2} strokeWidth="1.2"/>
            <path d="M1 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={text2} strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="13" cy="6" r="2.5" stroke={text2} strokeWidth="1.2"/>
          </svg>
          <div>
            <div className="text-xs font-semibold" style={{ color: "#711C31" }}>Total Users</div>
            <div className="text-sm font-bold" style={{ color: text1 }}>{total.toLocaleString()}</div>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold" style={{ color: "#711C31" }}>Total Clicks</div>
          <div className="text-sm font-bold" style={{ color: text1 }}>{clicks.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const card       = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder = isDark ? "border-[#753141]" : "border-[#753141]";
  const cardInner  = isDark ? "#d0baa3" : "#E4D5B8";
  const text1      = isDark ? "#591727" : "#591727";
  const text2      = isDark ? "#591727" : "#7A6040";

  return (
    <>
      <style>{`
        .an-page { margin-left: 40px; margin-top: 40px; }
        .an-stat-row { display: flex; gap: 16px; margin-bottom: 20px; }
        .an-stat-card { min-width: 300px; }
        .an-bot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 768px) {
          .an-page { margin-left: 0 !important; margin-top: 16px !important; padding: 0 4px !important; }
          .an-stat-row { flex-direction: column; }
          .an-stat-card { min-width: unset !important; width: 100% !important; }
          .an-bot-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="an-page min-h-full transition-colors duration-300">

        {/* ── Page Title ── */}
        <h1 className="text-3xl font-bold tracking-wide mb-6" style={{ color: isDark ? "#ffffff" : "#591727" }}>
          Analytics
        </h1>

        {/* ── Stat Cards ── */}
        <div className="an-stat-row">

          {/* Total Visitors */}
          <div
            className={`an-stat-card relative rounded-2xl p-6 border ${cardBorder}`}
            style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-md" style={{ color: "#591727" }}>Total Visitors</p>
              <span className="text-[13px] font-semibold px-4 py-1 rounded-full bg-[#84535f] text-white">
                +12% today
              </span>
            </div>
            <span className="text-4xl font-bold" style={{ color: text1 }}>120</span>
            <p className="text-xs mt-1" style={{ color: text2 }}>Today</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
              <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }}/>
            </div>
          </div>

          {/* Conversion Rate */}
          <div
            className={`an-stat-card relative rounded-2xl p-6 border ${cardBorder}`}
            style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}
          >
            <p className="text-md mb-3" style={{ color: "#591727" }}>Conversion rate</p>
            <span className="text-4xl font-bold" style={{ color: text1 }}>12%</span>
            <p className="text-xs mt-1" style={{ color: text2 }}>Visitor → Booking</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
              <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }}/>
            </div>
          </div>
        </div>

        {/* ── Total Visitors Area Chart ── */}
        <div className="mb-5">
          <TotalVisitorsChart
            isDark={isDark} card={card} cardBorder={cardBorder}
            cardInner={cardInner} text1={text1} text2={text2}
          />
        </div>

        {/* ── Bottom Row: Users + Conversion ── */}
        <div className="an-bot-grid">
          <UsersThisWeekChart
            isDark={isDark} card={card} cardBorder={cardBorder}
            text1={text1} text2={text2}
          />
          <ConversionRateChart
            isDark={isDark} card={card} cardBorder={cardBorder}
            text1={text1} text2={text2}
          />
        </div>

      </div>
    </>
  );
}