import { describe, it, expect, vi, beforeEach } from "vitest"
import { Prisma } from "@prisma/client"
import { type Context } from "@/server/trpc"

// Mock db before importing router
vi.mock("@/server/db", () => ({
  db: {
    quotation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    quotationItem: {
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

function createMockContext(overrides?: Partial<Context>): Context {
  return {
    session: null,
    ...overrides,
  }
}

function createMockSession(role: "ADMIN" | "MEMBER" | "VIEWER" = "MEMBER") {
  return {
    user: { id: "user-1", email: "test@test.com", name: "Test User", role },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }
}

const mockQuotation = {
  id: "q-1",
  eventId: "event-1",
  status: "DRAFT" as const,
  totalAmount: 0,
  driveFileId: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  items: [],
}

const mockItem = {
  id: "item-1",
  quotationId: "q-1",
  description: "Photography Service",
  quantity: 1,
  unitPrice: 5000,
  totalPrice: 5000,
}

describe("quotations router", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("create", () => {
    it("creates quotation linked to event with totalAmount: 0", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        quotation: {
          create: ReturnType<typeof vi.fn>
        }
      }
      mockDb.quotation.create.mockResolvedValueOnce(mockQuotation)

      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.create({ eventId: "event-1" })

      expect(result.eventId).toBe("event-1")
      expect(result.totalAmount).toBe(0)
      expect(mockDb.quotation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventId: "event-1",
            totalAmount: 0,
          }),
        })
      )
    })

    it("throws FORBIDDEN for VIEWER", async () => {
      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("VIEWER") })
      )
      await expect(caller.create({ eventId: "event-1" })).rejects.toMatchObject({
        code: "FORBIDDEN",
      })
    })
  })

  describe("getByEvent", () => {
    it("returns quotation with all items for an eventId", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        quotation: {
          findFirst: ReturnType<typeof vi.fn>
        }
      }
      const quotationWithItems = {
        ...mockQuotation,
        items: [mockItem],
      }
      mockDb.quotation.findFirst.mockResolvedValueOnce(quotationWithItems)

      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.getByEvent({ eventId: "event-1" })

      expect(result).not.toBeNull()
      expect(result?.items).toHaveLength(1)
      expect(result?.items[0].description).toBe("Photography Service")
    })

    it("returns null when no quotation exists for event", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        quotation: {
          findFirst: ReturnType<typeof vi.fn>
        }
      }
      mockDb.quotation.findFirst.mockResolvedValueOnce(null)

      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.getByEvent({ eventId: "event-1" })

      expect(result).toBeNull()
    })
  })

  describe("addItem", () => {
    it("computes totalPrice = quantity × unitPrice and updates Quotation.totalAmount", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        $transaction: ReturnType<typeof vi.fn>
      }

      const newItem = { ...mockItem, quantity: 2, unitPrice: 3000, totalPrice: 6000 }
      mockDb.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          quotationItem: { create: vi.fn().mockResolvedValueOnce(newItem) },
          quotation: {
            update: vi.fn().mockResolvedValueOnce({ ...mockQuotation, totalAmount: 6000 }),
          },
        }
        return fn(tx)
      })

      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.addItem({
        quotationId: "q-1",
        description: "Photography Service",
        quantity: 2,
        unitPrice: 3000,
      })

      expect(result.totalPrice).toBe(6000)
    })

    it("throws FORBIDDEN for VIEWER", async () => {
      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("VIEWER") })
      )
      await expect(
        caller.addItem({
          quotationId: "q-1",
          description: "Test",
          quantity: 1,
          unitPrice: 100,
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" })
    })
  })

  describe("updateItem", () => {
    it("updates quantity and unitPrice, recalculates totalPrice and updates Quotation.totalAmount", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        $transaction: ReturnType<typeof vi.fn>
      }

      const existingItem = {
        id: "item-1",
        quotationId: "q-1",
        description: "Photography Service",
        quantity: 1,
        unitPrice: 5000,
        totalPrice: 5000,
      }
      const updatedItem = {
        ...existingItem,
        quantity: 3,
        unitPrice: 4000,
        totalPrice: 12000,
      }

      mockDb.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          quotationItem: {
            findUniqueOrThrow: vi.fn().mockResolvedValueOnce(existingItem),
            update: vi.fn().mockResolvedValueOnce(updatedItem),
          },
          quotation: {
            update: vi.fn().mockResolvedValueOnce({ ...mockQuotation, totalAmount: 12000 }),
          },
        }
        return fn(tx)
      })

      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.updateItem({
        itemId: "item-1",
        quantity: 3,
        unitPrice: 4000,
      })

      expect(result.totalPrice).toBe(12000)
      expect(result.quantity).toBe(3)
      expect(result.unitPrice).toBe(4000)
    })

    it("throws NOT_FOUND when item does not exist", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        $transaction: ReturnType<typeof vi.fn>
      }

      const notFoundError = new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "1.0" })

      mockDb.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          quotationItem: {
            findUniqueOrThrow: vi.fn().mockRejectedValueOnce(notFoundError),
            update: vi.fn(),
          },
          quotation: {
            update: vi.fn(),
          },
        }
        return fn(tx)
      })

      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(caller.updateItem({ itemId: "nonexistent" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      })
    })
  })

  describe("removeItem", () => {
    it("decrements Quotation.totalAmount by item totalPrice", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        $transaction: ReturnType<typeof vi.fn>
      }

      mockDb.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          quotationItem: {
            findUniqueOrThrow: vi.fn().mockResolvedValueOnce(mockItem),
            delete: vi.fn().mockResolvedValueOnce(mockItem),
          },
          quotation: {
            update: vi
              .fn()
              .mockResolvedValueOnce({ ...mockQuotation, totalAmount: 0 }),
          },
        }
        return fn(tx)
      })

      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.removeItem({ itemId: "item-1" })

      expect(result).toEqual({ success: true })
    })

    it("throws FORBIDDEN for VIEWER", async () => {
      const { quotationsRouter } = await import("@/server/routers/quotations.router")
      const caller = quotationsRouter.createCaller(
        createMockContext({ session: createMockSession("VIEWER") })
      )
      await expect(caller.removeItem({ itemId: "item-1" })).rejects.toMatchObject({
        code: "FORBIDDEN",
      })
    })
  })
})
