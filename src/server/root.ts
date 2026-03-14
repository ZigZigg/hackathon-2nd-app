import { createTRPCRouter } from "@/server/trpc"
import { authRouter } from "@/server/routers/auth.router"
import { dashboardRouter } from "@/server/routers/dashboard.router"
import { customersRouter } from "@/server/routers/customers.router"
import { eventsRouter } from "@/server/routers/events.router"
import { quotationsRouter } from "@/server/routers/quotations.router"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  customers: customersRouter,
  events: eventsRouter,
  quotations: quotationsRouter,
})

export type AppRouter = typeof appRouter
