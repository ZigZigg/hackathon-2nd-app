import { createTRPCRouter } from "@/server/trpc"
import { authRouter } from "@/server/routers/auth.router"
import { dashboardRouter } from "@/server/routers/dashboard.router"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
