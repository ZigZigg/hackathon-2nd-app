import { createTRPCRouter } from "@/server/trpc"
import { authRouter } from "@/server/routers/auth.router"

export const appRouter = createTRPCRouter({
  auth: authRouter,
})

export type AppRouter = typeof appRouter
