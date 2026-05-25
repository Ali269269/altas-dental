"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Data ──────────────────────────────────────────────────────────────────────
const socialChannels = [
  {
    icon: (color: string) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    label: "Social Media (Instagram / Fb / LinkedIn)",
    growth: "42% Growth",
    pct: 42,
    barColor: "#591727",
    detail: "Instagram leads with 62% of social traffic. Facebook contributes 28%, LinkedIn 10%. Reels perform best.",
  },
  {
    icon: (color: string) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    label: "Google Search Ads",
    growth: "28% Growth",
    pct: 28,
    barColor: "#591727",
    detail: "Google Ads CPC is $1.24. Click-through rate: 3.7%. Top keyword: 'dental clinic near me'.",
  },
  {
    icon: (color: string) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: "Newsletter & Retargeting",
    growth: "15% Growth",
    pct: 15,
    barColor: "#591727",
    detail: "Newsletter open rate 32.4%. Retargeting click-through 4.8%. Unsubscribe rate: 0.3%.",
  },
];

const patientFlow = [
  { label: "Organic Search", sub: "SEO Optimization", count: 48, dot: "#720e26" },
  { label: "Referrals",      sub: "Patient Network",  count: 32, dot: "#84535f" },
  { label: "Paid Social",    sub: "Meta Campaigns",   count: 26, dot: "#B0A0A0" },
  { label: "Direct / Other", sub: "Walk-ins, Print",  count: 36, dot: "#591727" },
];

const emailCampaigns = [
  {
    tag: "SENT", tagColor: "#3DAA7A",
    category: "MONTHLY NEWSLETTER",
    title: "June Oral Health Update",
    openRate: "32.4%", clickThrough: "4.8%",
  },
  {
    tag: "DRAFT", tagColor: "#C9922A",
    category: "SEASONAL PROMO",
    title: "Summer Whitening Special",
    openRate: "—", clickThrough: "—",
  },
];

const weeklyData = [18, 30, 22, 40, 35, 28, 45];
const weekDays   = ["M", "T", "W", "T", "F", "S", "S"];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MarketingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const card        = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder  = isDark ? "border-[#753141]" : "border-[#753141]";
  const cardInner   = isDark ? "#d0baa3" : "#FFFFFF";
  const text1       = isDark ? "#591727" : "#591727";
  const text2       = isDark ? "#591727" : "#7A6040";
  const inputBg     = isDark ? "#c1a694" : "#ffffff";
  const inputBorder = isDark ? "#5C2A3A" : "#D9C9A8";

  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [campaignName, setCampaignName]   = useState("");
  const [channel, setChannel]             = useState("");
  const [budget, setBudget]               = useState("");
  const [launched, setLaunched]           = useState(false);

  const maxBar    = Math.max(...weeklyData);
  const flowTotal = patientFlow.reduce((a, b) => a + b.count, 0);

  function handleLaunch() {
    if (!campaignName || !channel) return;
    setLaunched(true);
    setTimeout(() => {
      setLaunched(false);
      setCampaignName(""); setChannel(""); setBudget("");
    }, 2500);
  }

  return (
    <>
      <style>{`
        .mk-page { margin-left: 40px; margin-top: 40px; }
        .mk-stat-row { display: flex; gap: 16px; margin-bottom: 20px; }
        .mk-stat-card { min-width: 300px; }
        .mk-mid-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; margin-bottom: 16px; }
        .mk-bot-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
        .mk-email-stats { display: flex; gap: 80px; }
        @media (max-width: 768px) {
          .mk-page { margin-left: 200 !important; margin-top: 16px !important; padding: 0 4px !important; }
          .mk-stat-row { flex-direction: column; }
          .mk-stat-card { min-width: unset !important; width: 100% !important; }
          .mk-mid-grid { grid-template-columns: 1fr !important; }
          .mk-bot-grid { grid-template-columns: 1fr !important; }
          .mk-email-stats { gap: 32px; }
        }
      `}</style>

      <div className="mk-page min-h-full transition-colors duration-300">

        {/* ── Page Title ── */}
        <h1 className="text-3xl font-bold tracking-wide mb-6" style={{ color: isDark ? "#ffffff" : "#591727" }}>
          Marketing
        </h1>

        {/* ── Stat Cards ── */}
        <div className="mk-stat-row">

          {/* New Patients */}
          <div className={`mk-stat-card relative rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-md" style={{ color: "#591727" }}>New Patients</p>
              <span className="text-[10px] font-semibold px-4 py-1 rounded-full bg-[#84535f] text-white">+12%</span>
            </div>
            <span className="text-4xl font-bold numeric-font" style={{ color: text1 }}>12</span>
            <p className="text-md mt-1" style={{ color: "#591727" }}>This month via ads</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
              <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }} />
            </div>
          </div>

          {/* Ad Spend */}
          <div className={`mk-stat-card relative rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}>
            <p className="text-md mb-3" style={{ color: "#591727" }}>Ad Spend</p>
            <span className="text-4xl font-bold numeric-font" style={{ color: text1 }}>$ 4.2k</span>
            <p className="text-md mt-1 mb-2" style={{ color: "#591727" }}>Budget utilized: 84%</p>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: isDark ? "#5C2A3A" : "#a07d85" }}>
              <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: "84%", backgroundColor: isDark ? "#591727" : "#591727" }} />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
              <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }} />
            </div>
          </div>
        </div>

        {/* ── Middle Row: Socials + Patient Flow ── */}
        <div className="mk-mid-grid">

          {/* Socials Performance */}
          <div className={`rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className="text-[14px] numeric-font font-bold tracking-widest uppercase mb-5" style={{ color: "#591727" }}>
              SOCIALS PERFORMANCE
            </p>
            <div className="flex flex-col gap-7">
              {socialChannels.map((ch, i) => (
                <div key={i}>
                  <div
                    className="flex items-center justify-between mb-2 cursor-pointer"
                    onClick={() => setActiveChannel(activeChannel === i ? null : i)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cardInner }}>
                        {ch.icon(text1)}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: text1 }}>{ch.label}</span>
                    </div>
                    <span className="text-sm font-bold shrink-0 ml-2" style={{ color: text2 }}>{ch.growth}</span>
                  </div>
                  <div className="h-1.5 rounded-full mb-1" style={{ backgroundColor: isDark ? "#5C2A3A" : "#84535f" }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${ch.pct}%`, backgroundColor: ch.barColor }}
                    />
                  </div>
                  {activeChannel === i && (
                    <div
                      className={`mt-2 px-4 py-3 rounded-xl border ${cardBorder} text-xs`}
                      style={{ backgroundColor: cardInner, color: text2 }}
                    >
                      {ch.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Patient Flow */}
          <div className={`rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className="text-[14px] font-bold numeric-font tracking-widest uppercase mb-5" style={{ color: "#591727" }}>
              PATIENT FLOW
            </p>
            <div className="flex flex-col gap-3">
              {patientFlow.map((pf, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${cardBorder} cursor-pointer transition-opacity hover:opacity-90`}
                  style={{ backgroundColor: cardInner }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pf.dot }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: text1 }}>{pf.label}</p>
                      <p className="text-[11px]" style={{ color: text2 }}>{pf.sub}</p>
                    </div>
                  </div>
                  <span className="text-base font-bold numeric-font" style={{ color: text1 }}>{pf.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Email Analytics + Campaign ── */}
        <div className="mk-bot-grid">

          {/* Email Analytics */}
          <div className={`rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[14px] font-bold numeric-font tracking-widest uppercase" style={{ color: "#591727" }}>
                EMAIL ANALYTICS
              </p>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            {/* Campaign Card */}
            <div className={`rounded-2xl p-5 border ${cardBorder} mb-4`} style={{ backgroundColor: cardInner }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] numeric-font font-bold mb-1" style={{ color: "#591727" }}>
                    Monthly Newsletter
                  </p>
                  <p className="text-base font-bold" style={{ color: text1 }}>
                    June Oral Health Update
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: "#84535f" }}
                >
                  SENT
                </span>
              </div>
              <div className="mk-email-stats">
                <div>
                  <p className="text-2xl font-bold numeric-font" style={{ color: "#7D1E35" }}>32.4%</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: text2 }}>Open Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold numeric-font" style={{ color: "#591727" }}>4.8%</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: text2 }}>Click Through</p>
                </div>
              </div>
            </div>

            {/* Insight */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#F2DADA" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7D1E35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <p className="text-md italic" style={{ color: "#591727" }}>
                "Personalized subject lines increased open rates by 12% this month."
              </p>
            </div>
          </div>

          {/* Right Column placeholder — kept as-is from original */}
          <div />
        </div>
      </div>
    </>
  );
}