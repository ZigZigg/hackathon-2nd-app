import { describe, it, expect, vi, beforeEach } from "vitest"
import { type Context } from "@/server/trpc"

// Mock db before importing router
vi.mock("@/server/db", () => ({
  db: {
    customer: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    customerInteraction: {
      create: vi.fn(),
    },
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

const mockCustomer = {
  id: "cust-1",
  name: "Alice Nguyen",
  phone: "0901234567",
  email: "alice@example.com",
  company: "ACME Corp",
  address: "123 Street",
  status: "ACTIVE" as const,
  zaloUserId: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  interactions: [],
}

describe("customers router", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list", () => {
    it("returns paginated results with no filters", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          findMany: ReturnType<typeof vi.fn>
          count: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customer.findMany.mockResolvedValueOnce([mockCustomer])
      mockDb.customer.count.mockResolvedValueOnce(1)

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.list({ page: 1, pageSize: 20 })

      expect(result.items).toHaveLength(1)
      expect(result.totalCount).toBe(1)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
    })

    it("filters by search term across name/phone/email", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          findMany: ReturnType<typeof vi.fn>
          count: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customer.findMany.mockResolvedValueOnce([mockCustomer])
      mockDb.customer.count.mockResolvedValueOnce(1)

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.list({ search: "Alice", page: 1, pageSize: 20 })

      expect(result.items).toHaveLength(1)
      expect(mockDb.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: "Alice" }) }),
            ]),
          }),
        })
      )
    })

    it("filters by status", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          findMany: ReturnType<typeof vi.fn>
          count: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customer.findMany.mockResolvedValueOnce([mockCustomer])
      mockDb.customer.count.mockResolvedValueOnce(1)

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.list({ status: "ACTIVE", page: 1, pageSize: 20 })

      expect(result.items).toHaveLength(1)
      expect(mockDb.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "ACTIVE" }),
        })
      )
    })

    it("throws UNAUTHORIZED for unauthenticated caller", async () => {
      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(createMockContext({ session: null }))
      await expect(caller.list({ page: 1, pageSize: 20 })).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      })
    })
  })

  describe("getById", () => {
    it("returns customer with interactions", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
        }
      }
      const customerWithInteractions = {
        ...mockCustomer,
        interactions: [
          {
            id: "int-1",
            customerId: "cust-1",
            type: "CALL",
            notes: "Called about pricing",
            staffId: "user-1",
            createdAt: new Date("2026-01-02"),
          },
        ],
      }
      mockDb.customer.findUniqueOrThrow.mockResolvedValueOnce(customerWithInteractions)

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.getById({ id: "cust-1" })

      expect(result.id).toBe("cust-1")
      expect(result.interactions).toHaveLength(1)
      expect(mockDb.customer.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "cust-1" },
          include: expect.objectContaining({
            interactions: expect.objectContaining({ orderBy: { createdAt: "desc" } }),
          }),
        })
      )
    })

    it("throws NOT_FOUND for non-existent id", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customer.findUniqueOrThrow.mockRejectedValueOnce(
        Object.assign(new Error("Record not found"), { code: "P2025" })
      )

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(caller.getById({ id: "nonexistent" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      })
    })
  })

  describe("create", () => {
    it("creates and returns a new customer", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          create: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customer.create.mockResolvedValueOnce(mockCustomer)

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.create({
        name: "Alice Nguyen",
        phone: "0901234567",
        email: "alice@example.com",
        company: "ACME Corp",
        address: "123 Street",
        status: "ACTIVE",
      })

      expect(result.name).toBe("Alice Nguyen")
      expect(mockDb.customer.create).toHaveBeenCalledOnce()
    })

    it("throws FORBIDDEN for VIEWER", async () => {
      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("VIEWER") })
      )
      await expect(
        caller.create({ name: "Test", phone: "0900000000", status: "PROSPECT" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" })
    })
  })

  describe("update", () => {
    it("modifies customer fields", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          update: ReturnType<typeof vi.fn>
        }
      }
      const updatedCustomer = { ...mockCustomer, name: "Alice Updated" }
      mockDb.customer.update.mockResolvedValueOnce(updatedCustomer)

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.update({ id: "cust-1", name: "Alice Updated" })

      expect(result.name).toBe("Alice Updated")
      expect(mockDb.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "cust-1" },
          data: expect.objectContaining({ name: "Alice Updated" }),
        })
      )
    })

    it("throws NOT_FOUND when updating non-existent customer", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          update: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customer.update.mockRejectedValueOnce(
        Object.assign(new Error("Record not found"), { code: "P2025" })
      )

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(caller.update({ id: "nonexistent", name: "Test" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      })
    })
  })

  describe("delete", () => {
    it("succeeds for ADMIN", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          delete: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customer.delete.mockResolvedValueOnce(mockCustomer)

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("ADMIN") })
      )
      const result = await caller.delete({ id: "cust-1" })

      expect(result).toEqual({ success: true })
      expect(mockDb.customer.delete).toHaveBeenCalledWith({ where: { id: "cust-1" } })
    })

    it("throws NOT_FOUND when deleting non-existent customer", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customer: {
          delete: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customer.delete.mockRejectedValueOnce(
        Object.assign(new Error("Record not found"), { code: "P2025" })
      )

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("ADMIN") })
      )
      await expect(caller.delete({ id: "nonexistent" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      })
    })

    it("throws FORBIDDEN for MEMBER", async () => {
      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(caller.delete({ id: "cust-1" })).rejects.toMatchObject({
        code: "FORBIDDEN",
      })
    })
  })

  describe("addInteraction", () => {
    it("throws NOT_FOUND when customer does not exist (FK violation)", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customerInteraction: {
          create: ReturnType<typeof vi.fn>
        }
      }
      mockDb.customerInteraction.create.mockRejectedValueOnce(
        Object.assign(new Error("Foreign key constraint failed"), { code: "P2003" })
      )

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(
        caller.addInteraction({ customerId: "nonexistent", type: "CALL", notes: "Test" })
      ).rejects.toMatchObject({ code: "NOT_FOUND" })
    })

    it("creates an interaction record linked to the customer", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        customerInteraction: {
          create: ReturnType<typeof vi.fn>
        }
      }
      const newInteraction = {
        id: "int-1",
        customerId: "cust-1",
        type: "CALL",
        notes: "Discussed requirements",
        staffId: "user-1",
        createdAt: new Date(),
      }
      mockDb.customerInteraction.create.mockResolvedValueOnce(newInteraction)

      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.addInteraction({
        customerId: "cust-1",
        type: "CALL",
        notes: "Discussed requirements",
      })

      expect(result.customerId).toBe("cust-1")
      expect(result.type).toBe("CALL")
      expect(mockDb.customerInteraction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: "cust-1",
            type: "CALL",
            notes: "Discussed requirements",
            staffId: "user-1",
          }),
        })
      )
    })

    it("throws FORBIDDEN for VIEWER", async () => {
      const { customersRouter } = await import("@/server/routers/customers.router")
      const caller = customersRouter.createCaller(
        createMockContext({ session: createMockSession("VIEWER") })
      )
      await expect(
        caller.addInteraction({ customerId: "cust-1", type: "CALL", notes: "Test" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" })
    })
  })
})
