import { describe, it, expect, vi, beforeEach } from "vitest"

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
    session: { user: { id: "u1", role: "ADMIN", email: "a@a.com", name: "A" }, expires: "2099-01-01" } as never,
  }
}

describe("dashboardRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getMetrics", () => {
    it("returns { revenue, costs, profit, period } with correct calculations", async () => {
      const mockDb = db as unknown as {
        transaction: {
          aggregate: ReturnType<typeof vi.fn>
        }
      }

      // First call = INCOME, second call = EXPENSE
      mockDb.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 5000 } })
        .mockResolvedValueOnce({ _sum: { amount: 2000 } })

      const { dashboardRouter } = await import("@/server/routers/dashboard.router")
      const caller = dashboardRouter.createCaller(createAdminCtx())
      const result = await caller.getMetrics({ month: 3, year: 2026 })

      expect(result.revenue).toBe(5000)
      expect(result.costs).toBe(2000)
      expect(result.profit).toBe(3000)
      expect(result.period).toEqual({ month: 3, year: 2026 })
    })

    it("returns zeros when no data (null sums)", async () => {
      const mockDb = db as unknown as {
        transaction: {
          aggregate: ReturnType<typeof vi.fn>
        }
      }

      mockDb.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: null } })
        .mockResolvedValueOnce({ _sum: { amount: null } })

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
      const mockDb = db as unknown as {
        transaction: {
          groupBy: ReturnType<typeof vi.fn>
        }
      }

      mockDb.transaction.groupBy.mockResolvedValueOnce([])

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

    it("items are in chronological order", async () => {
      const mockDb = db as unknown as {
        transaction: {
          groupBy: ReturnType<typeof vi.fn>
        }
      }

      const now = new Date()
      const year = now.getFullYear()

      // Return entries for month 1 and month 3 of the current year
      mockDb.transaction.groupBy.mockResolvedValueOnce([
        { date: new Date(year, 2, 15), _sum: { amount: 300 } }, // March
        { date: new Date(year, 0, 10), _sum: { amount: 100 } }, // January
      ])

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
      const mockDb = db as unknown as {
        event: {
          groupBy: ReturnType<typeof vi.fn>
        }
      }

      mockDb.event.groupBy.mockResolvedValueOnce([
        { type: "WEDDING", _count: { type: 3 } },
      ])

      const { dashboardRouter } = await import("@/server/routers/dashboard.router")
      const caller = dashboardRouter.createCaller(createAdminCtx())
      const result = await caller.getEventBreakdown()

      expect(result).toEqual([{ type: "WEDDING", count: 3 }])
    })
  })
})
