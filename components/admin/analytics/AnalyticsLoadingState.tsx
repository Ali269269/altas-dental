"use client";

type AnalyticsLoadingStateProps = {
  isDark: boolean;
};

export function AnalyticsLoadingState({ isDark }: AnalyticsLoadingStateProps) {
  const shimmer = isDark ? "#5C2A3A" : "#E8D8C0";

  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      <div className="an-stat-row">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="an-stat-card rounded-2xl p-6 border border-[#753141]"
            style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", minHeight: 140 }}
          >
            <div className="h-4 w-32 rounded mb-4" style={{ backgroundColor: shimmer }} />
            <div className="h-10 w-20 rounded mb-2" style={{ backgroundColor: shimmer }} />
            <div className="h-3 w-16 rounded" style={{ backgroundColor: shimmer }} />
          </div>
        ))}
      </div>
      <div
        className="rounded-2xl p-5 border border-[#753141]"
        style={{ backgroundColor: isDark ? "#c9a898" : "#f0f0f0", minHeight: 280 }}
      >
        <div className="h-6 w-40 rounded mb-6" style={{ backgroundColor: shimmer }} />
        <div className="h-48 rounded" style={{ backgroundColor: shimmer }} />
      </div>
      <div className="an-bot-grid">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="rounded-2xl p-5 border border-[#753141]"
            style={{ backgroundColor: isDark ? "#c9a898" : "#f0f0f0", minHeight: 320 }}
          >
            <div className="h-6 w-36 rounded mb-6" style={{ backgroundColor: shimmer }} />
            <div className="h-52 rounded" style={{ backgroundColor: shimmer }} />
          </div>
        ))}
      </div>
    </div>
  );
}
