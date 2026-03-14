"use client"
import { useState } from "react"
import { useDashboard } from "@/hooks/useDashboard"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart"
import { EventBreakdownChart } from "@/components/dashboard/EventBreakdownChart"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const { metrics, trend, breakdown, isLoading } = useDashboard(period)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <select
          value={period.month}
          onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
          className="rounded border px-2 py-1 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={period.year}
          onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
          className="w-20 rounded border px-2 py-1 text-sm"
          min={2000}
          max={2100}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <MetricCard label="Revenue" value={metrics?.revenue ?? 0} />
            <MetricCard label="Costs" value={metrics?.costs ?? 0} />
            <MetricCard
              label="Net Profit"
              value={metrics?.profit ?? 0}
              trend={metrics && metrics.profit >= 0 ? "up" : "down"}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isLoading ? <Skeleton className="h-64" /> : <RevenueTrendChart data={trend ?? []} />}
        {isLoading ? <Skeleton className="h-64" /> : <EventBreakdownChart data={breakdown ?? []} />}
      </div>
    </div>
  )
}
