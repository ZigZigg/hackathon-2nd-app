"use client"
import { useState } from "react"
import { useDashboard } from "@/hooks/useDashboard"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart"
import { EventBreakdownChart } from "@/components/dashboard/EventBreakdownChart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2000, i).toLocaleString("vi-VN", { month: "long" }),
}))

export default function DashboardPage() {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const { metrics, trend, breakdown, isLoading, isError } = useDashboard(period)

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <p className="text-sm text-destructive">Failed to load dashboard data. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Select
          value={String(period.month)}
          onValueChange={(v) => setPeriod((p) => ({ ...p, month: Number(v) }))}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          value={period.year}
          onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
          className="w-24"
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
