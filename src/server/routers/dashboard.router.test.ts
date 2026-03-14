import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Session } from "next-auth"

vi.mock("@/server/db", () => ({
  db: {
    transaction: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    event: {
      groupBy: vi.fn(),
    },
  },
}))

import { db } from "@/server/db"

function createAdminCtx() {
  return {
    session: {
      user: { id: "u1", role: "ADMIN" as const, email: "a@a.com", name: "Admin" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as Session,
  }
}

describe("dashboardRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getMetrics", () => {
    it("returns { revenue, costs, profit, period } with correct calculations", async () => {
      // First call = INCOME, second call = EXPENSE
      vi.mocked(db.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: 5000 } } as never)
        .mockResolvedValueOnce({ _sum: { amount: 2000 } } as never)

      const { dashboardRouter } = await import("@/server/routers/dashboard.router")
      const caller = dashboardRouter.createCaller(createAdminCtx())
      const result = await caller.getMetrics({ month: 3, year: 2026 })

      expect(result.revenue).toBe(5000)
      expect(result.costs).toBe(2000)
      expect(result.profit).toBe(3000)
      expect(result.period).toEqual({ month: 3, year: 2026 })
    })

    it("returns zeros when no data (null sums)", async () => {
      vi.mocked(db.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: null } } as never)
        .mockResolvedValueOnce({ _sum: { amount: null } } as never)

      const { dashboardRouter } = await import("@/server/routers/dashboard.router")
      const caller = dashboardRouter.createCaller(createAdminCtx())
      const result = await caller.getMetrics({ month: 3, year: 2026 })

      expect(result.revenue).toBe(0)
      expect(result.costs).toBe(0)
      expect(result.profit).toBe(0)
    })
  })

  describe("getRevenueTrend", () => {
    it("returns exactly 12 items when groupBy returns empty array", async () => {
      vi.mocked(db.transaction.groupBy).mockResolvedValueOnce([] as never)

      const { dashboardRouter } = await import("@/server/routers/dashboard.router")
      const caller = dashboardRouter.createCaller(createAdminCtx())
      const result = await caller.getRevenueTrend()

      expect(result).toHaveLength(12)
      result.forEach((item) => {
        expect(item.total).toBe(0)
        expect(item).toHaveProperty("month")
        expect(item).toHaveProperty("year")
      })
    })

    it("passes a 12-month date range filter to groupBy", async () => {
      vi.mocked(db.transaction.groupBy).mockResolvedValueOnce([] as never)

      const { dashboardRouter } = await import("@/server/routers/dashboard.router")
      const caller = dashboardRouter.createCaller(createAdminCtx())
      await caller.getRevenueTrend()

      const callArgs = vi.mocked(db.transaction.groupBy).mock.calls[0][0] as {
        where: { type: string; date: { gte: Date } }
      }
      expect(callArgs.where.type).toBe("INCOME")
      expect(callArgs.where.date?.gte).toBeInstanceOf(Date)
      // The gte date should be approximately 12 months ago
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
      twelveMonthsAgo.setDate(1)
      expect(callArgs.where.date.gte.getFullYear()).toBe(twelveMonthsAgo.getFullYear())
      expect(callArgs.where.date.gte.getMonth()).toBe(twelveMonthsAgo.getMonth())
    })

    it("items are in chronological order", async () => {
      const now = new Date()
      const year = now.getFullYear()

      // Return entries for recent months within the last 12 months
      vi.mocked(db.transaction.groupBy).mockResolvedValueOnce([
        { date: new Date(year, now.getMonth(), 15), _sum: { amount: 300 } },
        { date: new Date(year, now.getMonth() - 1, 10), _sum: { amount: 100 } },
      ] as never)

      const { dashboardRouter } = await import("@/server/routers/dashboard.router")
      const caller = dashboardRouter.createCaller(createAdminCtx())
      const result = await caller.getRevenueTrend()

      expect(result).toHaveLength(12)

      // Verify chronological order: each item should be after the previous
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1]
        const curr = result[i]
        const prevDate = new Date(prev.year, prev.month - 1, 1)
        const currDate = new Date(curr.year, curr.month - 1, 1)
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime())
      }
    })
  })

  describe("getEventBreakdown", () => {
    it("returns array of { type, count }", async () => {
      vi.mocked(db.event.groupBy).mockResolvedValueOnce([
        { type: "WEDDING", _count: { type: 3 } },
      ] as never)

      const { dashboardRouter } = await import("@/server/routers/dashboard.router")
      const caller = dashboardRouter.createCaller(createAdminCtx())
      const result = await caller.getEventBreakdown()

      expect(result).toEqual([{ type: "WEDDING", count: 3 }])
    })
  })
})
