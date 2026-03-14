import { initTRPC, TRPCError } from "@trpc/server"
import { type Session } from "next-auth"
import superjson from "superjson"
import { ZodError } from "zod"
import { Role } from "@prisma/client"

export interface Context {
  session: Session | null
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({ ctx: { ...ctx, session: ctx.session as Session } })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== Role.ADMIN) {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({ ctx })
})

export const memberProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role === Role.VIEWER) {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({ ctx })
})
