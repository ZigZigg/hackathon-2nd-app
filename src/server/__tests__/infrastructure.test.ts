import { describe, it, expect, vi, beforeAll } from "vitest"

// Mock PrismaClient since Prisma 7 requires a driver adapter at runtime
vi.mock("@prisma/client", () => {
  class PrismaClient {
    $connect = vi.fn()
    $disconnect = vi.fn()
  }
  return { PrismaClient }
})

describe("tRPC infrastructure", () => {
  it("exports createTRPCRouter from trpc.ts", async () => {
    const { createTRPCRouter } = await import("@/server/trpc")
    expect(typeof createTRPCRouter).toBe("function")
  })

  it("exports publicProcedure from trpc.ts", async () => {
    const { publicProcedure } = await import("@/server/trpc")
    expect(publicProcedure).toBeDefined()
  })

  it("exports protectedProcedure from trpc.ts", async () => {
    const { protectedProcedure } = await import("@/server/trpc")
    expect(protectedProcedure).toBeDefined()
  })

  it("exports appRouter from root.ts", async () => {
    const { appRouter } = await import("@/server/root")
    expect(appRouter).toBeDefined()
  })

  it("appRouter has _def property (is a valid tRPC router)", async () => {
    const { appRouter } = await import("@/server/root")
    expect(appRouter._def).toBeDefined()
  })
})

describe("Prisma db singleton", () => {
  it("exports db from db.ts", async () => {
    const { db } = await import("@/server/db")
    expect(db).toBeDefined()
  })
})

describe("Inngest client", () => {
  it("exports inngest from inngest/client.ts", async () => {
    const { inngest } = await import("@/inngest/client")
    expect(inngest).toBeDefined()
  })

  it("inngest client has correct id", async () => {
    const { inngest } = await import("@/inngest/client")
    // The Inngest client id is accessible via the id property
    expect((inngest as { id: string }).id).toBe("udika-erp")
  })
})
