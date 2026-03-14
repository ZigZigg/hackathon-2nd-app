import { describe, it, expect, vi, beforeEach } from "vitest"
import { createTRPCRouter, protectedProcedure, publicProcedure, type Context } from "@/server/trpc"
import { TRPCError } from "@trpc/server"

// Mock db before importing auth router
vi.mock("@/server/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Helper to create a mock context
function createMockContext(overrides?: Partial<Context>): Context {
  return {
    session: null,
    ...overrides,
  }
}

// Helper to create a fake session
function createMockSession(role: "ADMIN" | "MEMBER" | "VIEWER" = "MEMBER") {
  return {
    user: { id: "user-1", email: "test@test.com", name: "Test", role },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }
}

describe("tRPC middleware", () => {
  describe("protectedProcedure", () => {
    it("throws UNAUTHORIZED for unauthenticated caller", async () => {
      const testRouter = createTRPCRouter({
        test: protectedProcedure.query(() => "ok"),
      })
      const caller = testRouter.createCaller(createMockContext({ session: null }))
      await expect(caller.test()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      })
    })
  })

  describe("adminProcedure", () => {
    it("VIEWER throws UNAUTHORIZED", async () => {
      const { adminProcedure } = await import("@/server/trpc")
      const testRouter = createTRPCRouter({
        test: adminProcedure.query(() => "ok"),
      })
      const caller = testRouter.createCaller(
        createMockContext({ session: createMockSession("VIEWER") })
      )
      await expect(caller.test()).rejects.toMatchObject({ code: "UNAUTHORIZED" })
    })

    it("MEMBER throws UNAUTHORIZED", async () => {
      const { adminProcedure } = await import("@/server/trpc")
      const testRouter = createTRPCRouter({
        test: adminProcedure.query(() => "ok"),
      })
      const caller = testRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(caller.test()).rejects.toMatchObject({ code: "UNAUTHORIZED" })
    })

    it("ADMIN proceeds", async () => {
      const { adminProcedure } = await import("@/server/trpc")
      const testRouter = createTRPCRouter({
        test: adminProcedure.query(() => "ok"),
      })
      const caller = testRouter.createCaller(
        createMockContext({ session: createMockSession("ADMIN") })
      )
      await expect(caller.test()).resolves.toBe("ok")
    })
  })

  describe("memberProcedure", () => {
    it("VIEWER throws UNAUTHORIZED", async () => {
      const { memberProcedure } = await import("@/server/trpc")
      const testRouter = createTRPCRouter({
        test: memberProcedure.query(() => "ok"),
      })
      const caller = testRouter.createCaller(
        createMockContext({ session: createMockSession("VIEWER") })
      )
      await expect(caller.test()).rejects.toMatchObject({ code: "UNAUTHORIZED" })
    })

    it("MEMBER proceeds", async () => {
      const { memberProcedure } = await import("@/server/trpc")
      const testRouter = createTRPCRouter({
        test: memberProcedure.query(() => "ok"),
      })
      const caller = testRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(caller.test()).resolves.toBe("ok")
    })

    it("ADMIN proceeds", async () => {
      const { memberProcedure } = await import("@/server/trpc")
      const testRouter = createTRPCRouter({
        test: memberProcedure.query(() => "ok"),
      })
      const caller = testRouter.createCaller(
        createMockContext({ session: createMockSession("ADMIN") })
      )
      await expect(caller.test()).resolves.toBe("ok")
    })
  })
})

describe("auth router", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getSession", () => {
    it("returns null when unauthenticated", async () => {
      const { authRouter } = await import("@/server/routers/auth.router")
      const caller = authRouter.createCaller(createMockContext({ session: null }))
      const result = await caller.getSession()
      expect(result).toBeNull()
    })

    it("returns session when authenticated", async () => {
      const { authRouter } = await import("@/server/routers/auth.router")
      const session = createMockSession("MEMBER")
      const caller = authRouter.createCaller(createMockContext({ session }))
      const result = await caller.getSession()
      expect(result).toEqual(session)
    })
  })

  describe("changePassword", () => {
    it("rejects wrong current password", async () => {
      const bcrypt = await import("bcryptjs")
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        user: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
          update: ReturnType<typeof vi.fn>
        }
      }
      mockDb.user.findUniqueOrThrow.mockResolvedValueOnce({
        id: "user-1",
        hashedPassword: await bcrypt.hash("correctpassword", 12),
      })

      const { authRouter } = await import("@/server/routers/auth.router")
      const caller = authRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(
        caller.changePassword({
          currentPassword: "wrongpassword",
          newPassword: "newpassword123",
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" })
    })

    it("rejects password shorter than 8 chars", async () => {
      const { authRouter } = await import("@/server/routers/auth.router")
      const caller = authRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      await expect(
        caller.changePassword({
          currentPassword: "currentpassword",
          newPassword: "short",
        })
      ).rejects.toThrow()
    })

    it("succeeds with valid input", async () => {
      const bcrypt = await import("bcryptjs")
      const { db } = await import("@/server/db")
      const mockDb = db as unknown as {
        user: {
          findUniqueOrThrow: ReturnType<typeof vi.fn>
          update: ReturnType<typeof vi.fn>
        }
      }
      mockDb.user.findUniqueOrThrow.mockResolvedValueOnce({
        id: "user-1",
        hashedPassword: await bcrypt.hash("currentpassword", 12),
      })
      mockDb.user.update.mockResolvedValueOnce({ id: "user-1" })

      const { authRouter } = await import("@/server/routers/auth.router")
      const caller = authRouter.createCaller(
        createMockContext({ session: createMockSession("MEMBER") })
      )
      const result = await caller.changePassword({
        currentPassword: "currentpassword",
        newPassword: "newpassword123",
      })
      expect(result).toEqual({ success: true })
      expect(mockDb.user.update).toHaveBeenCalledOnce()
    })
  })
})
