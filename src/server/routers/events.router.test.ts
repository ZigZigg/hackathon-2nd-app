import { describe, it, expect, vi, beforeEach } from "vitest"
import { type Context } from "@/server/trpc"

// Mock db before importing router
vi.mock("@/server/db", () => ({
  db: {
    event: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    eventTeamMember: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

const mockEvent = {
  id: "event-1",
  name: "Grand Wedding",
  date: new Date("2026-06-15"),
  venue: "Ballroom A",
  type: "WEDDING" as const,
  status: "PLANNING" as const,
  budget: 50000,
  customerId: "cust-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  teamMembers: [],
  quotations: [],
}

describe("events router", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list", () => {
    it("returns paginated results with status filter", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findMany: ReturnType<typeof vi.fn>
          count: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.findMany.mockResolvedValueOnce([mockEvent])
      mockDb.event.count.mockResolvedValueOnce(1)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.list({ status: "PLANNING", page: 1, pageSize: 20 })

      expect(result.items).toHaveLength(1)
      expect(result.totalCount).toBe(1)
      expect(mockDb.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "PLANNING" }),
        })
      )
    })

    it("returns events within date range", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findMany: ReturnType<typeof vi.fn>
          count: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.findMany.mockResolvedValueOnce([mockEvent])
      mockDb.event.count.mockResolvedValueOnce(1)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const startDate = new Date("2026-06-01")
      const endDate = new Date("2026-06-30")
      const result = await caller.list({ startDate, endDate, page: 1, pageSize: 20 })

      expect(result.items).toHaveLength(1)
      expect(mockDb.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: startDate,
              lte: endDate,
            }),
          }),
        })
      )
    })
  })

  describe("create", () => {
    it("creates event with PLANNING status by default", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          create: ReturnType<typeof vi.fn>
        }
      }
      const createdEvent = { ...mockEvent, status: "PLANNING" as const }
      mockDb.event.create.mockResolvedValueOnce(createdEvent)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.create({
        name: "Grand Wedding",
        date: new Date("2026-06-15"),
        venue: "Ballroom A",
        type: "WEDDING",
        budget: 50000,
        customerId: "cust-1",
      })

      expect(result.status).toBe("PLANNING")
      expect(mockDb.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "PLANNING" }),
        })
      )
    })

    it("throws FORBIDDEN for VIEWER", async () => {
      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("VIEWER") })
      )
      await expect(
        caller.create({
          name: "Test",
          date: new Date("2026-06-15"),
          venue: "Venue",
          type: "WEDDING",
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" })
    })
  })

  describe("getById", () => {
    it("returns event with team members and quotation", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
        }
      }
      const eventWithDetails = {
        ...mockEvent,
        teamMembers: [
          { id: "tm-1", eventId: "event-1", userId: "user-1", role: "Coordinator", isCollaborator: false },
        ],
        quotations: [
          { id: "q-1", eventId: "event-1", status: "DRAFT", totalAmount: 0, items: [] },
        ],
      }
      mockDb.event.findUniqueOrThrow.mockResolvedValueOnce(eventWithDetails)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.getById({ id: "event-1" })

      expect(result.id).toBe("event-1")
      expect(result.teamMembers).toHaveLength(1)
      expect(result.quotations).toHaveLength(1)
    })

    it("throws NOT_FOUND for non-existent id", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.findUniqueOrThrow.mockRejectedValueOnce(
        Object.assign(new Error("Record not found"), { code: "P2025" })
      )

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(caller.getById({ id: "nonexistent" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      })
    })
  })

  describe("updateStatus", () => {
    it("PLANNING → CONFIRMED succeeds", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
          update: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.findUniqueOrThrow.mockResolvedValueOnce({ ...mockEvent, status: "PLANNING" })
      const confirmedEvent = { ...mockEvent, status: "CONFIRMED" as const }
      mockDb.event.update.mockResolvedValueOnce(confirmedEvent)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.updateStatus({ id: "event-1", status: "CONFIRMED" })

      expect(result.status).toBe("CONFIRMED")
    })

    it("COMPLETED → PLANNING throws BAD_REQUEST (invalid transition)", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.findUniqueOrThrow.mockResolvedValueOnce({ ...mockEvent, status: "COMPLETED" })

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(
        caller.updateStatus({ id: "event-1", status: "PLANNING" })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" })
    })

    it("CANCELLED → PLANNING throws BAD_REQUEST (terminal state)", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.findUniqueOrThrow.mockResolvedValueOnce({ ...mockEvent, status: "CANCELLED" })

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(
        caller.updateStatus({ id: "event-1", status: "PLANNING" })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" })
    })

    it("CONFIRMED → CANCELLED succeeds (cancel from non-terminal state)", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
          update: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.findUniqueOrThrow.mockResolvedValueOnce({ ...mockEvent, status: "CONFIRMED" })
      const cancelledEvent = { ...mockEvent, status: "CANCELLED" as const }
      mockDb.event.update.mockResolvedValueOnce(cancelledEvent)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.updateStatus({ id: "event-1", status: "CANCELLED" })

      expect(result.status).toBe("CANCELLED")
    })

    it("IN_PROGRESS → CANCELLED succeeds (cancel from non-terminal state)", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
          update: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.findUniqueOrThrow.mockResolvedValueOnce({ ...mockEvent, status: "IN_PROGRESS" })
      const cancelledEvent = { ...mockEvent, status: "CANCELLED" as const }
      mockDb.event.update.mockResolvedValueOnce(cancelledEvent)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.updateStatus({ id: "event-1", status: "CANCELLED" })

      expect(result.status).toBe("CANCELLED")
    })
  })

  describe("assignTeam", () => {
    it("adds a new team member to an event", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        eventTeamMember: {
          findFirst: ReturnType<typeof vi.fn>
          create: ReturnType<typeof vi.fn>
          update: ReturnType<typeof vi.fn>
        }
      }
      mockDb.eventTeamMember.findFirst.mockResolvedValueOnce(null)
      const newMember = {
        id: "tm-1",
        eventId: "event-1",
        userId: "user-2",
        collaboratorId: null,
        role: "Photographer",
        isCollaborator: false,
      }
      mockDb.eventTeamMember.create.mockResolvedValueOnce(newMember)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.assignTeam({
        eventId: "event-1",
        userId: "user-2",
        role: "Photographer",
        isCollaborator: false,
      })

      expect(result.role).toBe("Photographer")
      expect(mockDb.eventTeamMember.create).toHaveBeenCalledOnce()
    })

    it("re-assigning same user updates their role", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        eventTeamMember: {
          findFirst: ReturnType<typeof vi.fn>
          create: ReturnType<typeof vi.fn>
          update: ReturnType<typeof vi.fn>
        }
      }
      const existingMember = {
        id: "tm-1",
        eventId: "event-1",
        userId: "user-2",
        collaboratorId: null,
        role: "Photographer",
        isCollaborator: false,
      }
      mockDb.eventTeamMember.findFirst.mockResolvedValueOnce(existingMember)
      const updatedMember = { ...existingMember, role: "Lead Coordinator" }
      mockDb.eventTeamMember.update.mockResolvedValueOnce(updatedMember)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.assignTeam({
        eventId: "event-1",
        userId: "user-2",
        role: "Lead Coordinator",
        isCollaborator: false,
      })

      expect(result.role).toBe("Lead Coordinator")
      expect(mockDb.eventTeamMember.update).toHaveBeenCalledOnce()
      expect(mockDb.eventTeamMember.create).not.toHaveBeenCalled()
    })
  })

  describe("delete", () => {
    it("succeeds for ADMIN", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          delete: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.delete.mockResolvedValueOnce(mockEvent)

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("ADMIN") })
      )
      const result = await caller.delete({ id: "event-1" })

      expect(result).toEqual({ success: true })
    })

    it("throws FORBIDDEN for MEMBER", async () => {
      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(caller.delete({ id: "event-1" })).rejects.toMatchObject({
        code: "FORBIDDEN",
      })
    })

    it("throws NOT_FOUND when deleting non-existent event", async () => {
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        event: {
          delete: ReturnType<typeof vi.fn>
        }
      }
      mockDb.event.delete.mockRejectedValueOnce(
        Object.assign(new Error("Record not found"), { code: "P2025" })
      )

      const { eventsRouter } = await import("@/server/routers/events.router")
      const caller = eventsRouter.createCaller(
        createMockContext({ session: createMockSession("ADMIN") })
      )
      await expect(caller.delete({ id: "nonexistent" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      })
    })
  })
})
