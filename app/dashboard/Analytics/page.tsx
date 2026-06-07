"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { getToken, getAdmin } from "@/utils/auth";
import { useAnalyticsOverview } from "@/utils/useAnalyticsOverview";
import { AnalyticsErrorState } from "@/components/admin/analytics/AnalyticsErrorState";
import { AnalyticsLoadingState } from "@/components/admin/analytics/AnalyticsLoadingState";
import {
  AnalyticsStatCard,
  summaryToStatCards,
} from "@/components/admin/analytics/AnalyticsStatCard";
import { TotalVisitorsChart } from "@/components/admin/analytics/TotalVisitorsChart";
import { NewPatientsChart } from "@/components/admin/analytics/NewPatientsChart";
import { ConversionRateChart } from "@/components/admin/analytics/ConversionRateChart";

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  const card = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder = isDark ? "border-[#753141]" : "border-[#753141]";
  const text1 = "#591727";
  const text2 = isDark ? "#591727" : "#7A6040";

  const { data, loading, error, lastFetchedAt, refresh } = useAnalyticsOverview();

  useEffect(() => {
    const token = getToken();
    const admin = getAdmin();
    if (!token || !admin) {
      router.push("/login");
      return;
    }
    if (!admin?.roleSlug && !admin?.isSuperAdmin) {
      router.push("/unauthorized");
    }
  }, [router]);

  const statCards = summaryToStatCards(data.summary);

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
        <h1
          className="text-3xl font-bold tracking-wide mb-6"
          style={{ color: isDark ? "#ffffff" : "#591727" }}
        >
          Analytics
        </h1>

        {loading && !lastFetchedAt ? (
          <AnalyticsLoadingState isDark={isDark} />
        ) : error && !lastFetchedAt ? (
          <AnalyticsErrorState message={error} onRetry={refresh} isDark={isDark} />
        ) : (
          <>
            {error ? (
              <div className="mb-4">
                <AnalyticsErrorState message={error} onRetry={refresh} isDark={isDark} />
              </div>
            ) : null}

            <div className="an-stat-row">
              <AnalyticsStatCard
                title={statCards.visitors.title}
                value={statCards.visitors.value}
                subtitle={statCards.visitors.subtitle}
                badge={statCards.visitors.badge}
                isDark={isDark}
                cardBorder={cardBorder}
              />
              <AnalyticsStatCard
                title={statCards.conversion.title}
                value={statCards.conversion.value}
                subtitle={statCards.conversion.subtitle}
                isDark={isDark}
                cardBorder={cardBorder}
              />
            </div>

            <div className="mb-5">
              <TotalVisitorsChart
                data={data.visitorsChart}
                isDark={isDark}
                card={card}
                cardBorder={cardBorder}
                text1={text1}
                text2={text2}
              />
            </div>

            <div className="an-bot-grid">
              <NewPatientsChart
                data={data.usersChart}
                isDark={isDark}
                card={card}
                cardBorder={cardBorder}
                text1={text1}
                text2={text2}
              />
              <ConversionRateChart
                data={data.conversion}
                changePercent={data.summary.changePercent}
                isDark={isDark}
                card={card}
                cardBorder={cardBorder}
                text1={text1}
                text2={text2}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
