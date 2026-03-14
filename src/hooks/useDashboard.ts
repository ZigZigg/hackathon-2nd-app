"use client"
import { api } from "@/trpc/client"

export function useDashboard(period: { month: number; year: number }) {
  const metrics = api.dashboard.getMetrics.useQuery(period, { refetchInterval: 30_000 })
  const trend = api.dashboard.getRevenueTrend.useQuery(undefined, { refetchInterval: 30_000 })
  const breakdown = api.dashboard.getEventBreakdown.useQuery(undefined, { refetchInterval: 30_000 })

  return {
    metrics: metrics.data,
    trend: trend.data,
    breakdown: breakdown.data,
    isLoading: metrics.isLoading || trend.isLoading || breakdown.isLoading,
  }
}
