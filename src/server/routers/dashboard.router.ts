import { protectedProcedure, createTRPCRouter } from "@/server/trpc"
import { db } from "@/server/db"
import { periodSchema } from "@/lib/validations/dashboard.schema"

function buildRevenueTrendWindow(now: Date = new Date()) {
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const months: { month: number; year: number; total: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ month: d.getMonth() + 1, year: d.getFullYear(), total: 0 })
  }
  return { twelveMonthsAgo, months }
}

export const dashboardRouter = createTRPCRouter({
  getMetrics: protectedProcedure
    .input(periodSchema)
    .query(async ({ input }) => {
      const { month, year } = input
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)

      const [incomeAgg, expenseAgg] = await Promise.all([
        db.transaction.aggregate({
          where: { type: "INCOME", date: { gte: startDate, lte: endDate } },
          _sum: { amount: true },
        }),
        db.transaction.aggregate({
          where: { type: "EXPENSE", date: { gte: startDate, lte: endDate } },
          _sum: { amount: true },
        }),
      ])

      const revenue = incomeAgg._sum.amount ?? 0
      const costs = expenseAgg._sum.amount ?? 0
      return { revenue, costs, profit: revenue - costs, period: { month, year } }
    }),

  getRevenueTrend: protectedProcedure.query(async () => {
    const { twelveMonthsAgo, months } = buildRevenueTrendWindow()
    const results = await db.transaction.groupBy({
      by: ["date"],
      where: { type: "INCOME", date: { gte: twelveMonthsAgo } },
      _sum: { amount: true },
      orderBy: { date: "asc" },
    })

    // Aggregate by month+year
    for (const row of results) {
      const d = new Date(row.date)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const slot = months.find((x) => x.month === m && x.year === y)
      if (slot) slot.total += row._sum.amount ?? 0
    }

    return months
  }),

  getEventBreakdown: protectedProcedure.query(async () => {
    const rows = await db.event.groupBy({
      by: ["type"],
      _count: { type: true },
    })
    return rows.map((r) => ({ type: r.type, count: r._count.type }))
  }),
})
