"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
  label: string
  value: number
  trend?: "up" | "down" | "neutral"
}

const vndFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{vndFormatter.format(value)}</p>
        {trend && (
          <span className={`text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        )}
      </CardContent>
    </Card>
  )
}
