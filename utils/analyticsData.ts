export type AnalyticsPeriod = "Today" | "Week" | "Month";

export type ChartPoint = { t: string; v: number };
export type BarPoint = { label: string; v: number };
export type ConversionSlice = { visitors: number; clicks: number };

export type AnalyticsSummary = {
  totalVisitorsToday: number;
  changePercent: number;
  changeLabel: string;
  conversionRatePercent: number;
  conversionSubtitle: string;
};

export type AnalyticsOverview = {
  summary: AnalyticsSummary;
  visitorsChart: Record<AnalyticsPeriod, ChartPoint[]>;
  usersChart: Record<AnalyticsPeriod, BarPoint[]>;
  conversion: Record<AnalyticsPeriod, ConversionSlice>;
  metadata: {
    lastUpdated: string;
    totals: { today: number; week: number; year: number };
  };
};

const EMPTY_CHART: ChartPoint[] = [];
const EMPTY_BARS: BarPoint[] = [];
const EMPTY_CONVERSION: ConversionSlice = { visitors: 0, clicks: 0 };

export const DEFAULT_ANALYTICS_OVERVIEW: AnalyticsOverview = {
  summary: {
    totalVisitorsToday: 0,
    changePercent: 0,
    changeLabel: "0% vs yesterday",
    conversionRatePercent: 0,
    conversionSubtitle: "Request → Confirmed",
  },
  visitorsChart: {
    Today: EMPTY_CHART,
    Week: EMPTY_CHART,
    Month: EMPTY_CHART,
  },
  usersChart: {
    Today: EMPTY_BARS,
    Week: EMPTY_BARS,
    Month: EMPTY_BARS,
  },
  conversion: {
    Today: EMPTY_CONVERSION,
    Week: EMPTY_CONVERSION,
    Month: EMPTY_CONVERSION,
  },
  metadata: {
    lastUpdated: new Date(0).toISOString(),
    totals: { today: 0, week: 0, year: 0 },
  },
};

export function mergeAnalyticsOverview(
  partial: Partial<AnalyticsOverview> | undefined
): AnalyticsOverview {
  if (!partial) return DEFAULT_ANALYTICS_OVERVIEW;

  return {
    summary: { ...DEFAULT_ANALYTICS_OVERVIEW.summary, ...partial.summary },
    visitorsChart: {
      ...DEFAULT_ANALYTICS_OVERVIEW.visitorsChart,
      ...partial.visitorsChart,
    },
    usersChart: {
      ...DEFAULT_ANALYTICS_OVERVIEW.usersChart,
      ...partial.usersChart,
    },
    conversion: {
      ...DEFAULT_ANALYTICS_OVERVIEW.conversion,
      ...partial.conversion,
    },
    metadata: {
      ...DEFAULT_ANALYTICS_OVERVIEW.metadata,
      ...partial.metadata,
      totals: {
        ...DEFAULT_ANALYTICS_OVERVIEW.metadata.totals,
        ...partial.metadata?.totals,
      },
    },
  };
}
