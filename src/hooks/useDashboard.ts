"use client"
import { api } from "@/trpc/client"

const DASHBOARD_REFETCH_INTERVAL_MS = 30_000

export function useDashboard(period: { month: number; year: number }) {
  const metrics = api.dashboard.getMetrics.useQuery(period, { refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS })
  const trend = api.dashboard.getRevenueTrend.useQuery(undefined, { refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS })
  const breakdown = api.dashboard.getEventBreakdown.useQuery(undefined, { refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS })

  return {
    metrics: metrics.data,
    trend: trend.data,
    breakdown: breakdown.data,
    isLoading: metrics.isLoading || trend.isLoading || breakdown.isLoading,
    isError: metrics.isError || trend.isError || breakdown.isError,
  }
}
