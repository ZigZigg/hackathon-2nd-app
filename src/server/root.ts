import { createTRPCRouter } from "@/server/trpc"
import { authRouter } from "@/server/routers/auth.router"
import { dashboardRouter } from "@/server/routers/dashboard.router"
import { customersRouter } from "@/server/routers/customers.router"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  customers: customersRouter,
})

export type AppRouter = typeof appRouter
