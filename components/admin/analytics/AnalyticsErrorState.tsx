"use client";

type AnalyticsErrorStateProps = {
  message: string;
  onRetry: () => void;
  isDark: boolean;
};

export function AnalyticsErrorState({
  message,
  onRetry,
  isDark,
}: AnalyticsErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl p-6 border border-[#753141] text-center"
      style={{ backgroundColor: isDark ? "#c9a898" : "#f0f0f0" }}
    >
      <p className="text-base font-semibold mb-2" style={{ color: "#591727" }}>
        Unable to load analytics
      </p>
      <p className="text-sm mb-4" style={{ color: isDark ? "#591727" : "#7A6040" }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "#591727" }}
      >
        Try again
      </button>
    </div>
  );
}
