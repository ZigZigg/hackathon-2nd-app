"use client"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EventBreakdownItem {
  type: string
  count: number
}

interface EventBreakdownChartProps {
  data: EventBreakdownItem[]
}

const CHART_COLORS = [1, 2, 3, 4, 5].map((i) => `var(--chart-${i})`)

export function EventBreakdownChart({ data }: EventBreakdownChartProps) {
  const isEmpty = data.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Event Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="relative h-64">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <svg
              className="h-20 w-20 text-muted-foreground/30"
              viewBox="0 0 80 80"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" strokeDasharray="8 4" />
            </svg>
            <p className="text-sm text-muted-foreground">No events</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ type, percent }) =>
                  `${type} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} events`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
