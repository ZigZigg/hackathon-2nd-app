"use client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueTrendItem {
  month: number
  year: number
  total: number
}

interface RevenueTrendChartProps {
  data: RevenueTrendItem[]
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const hasData = data.some((d) => d.total > 0)

  const chartData = data.map((d) => ({
    label: `${MONTH_LABELS[d.month - 1]} ${d.year}`,
    total: d.total,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Revenue Trend (12 months)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {!hasData ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
              <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
