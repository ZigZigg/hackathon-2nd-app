import { createCallerFactory } from "@trpc/server"
import { appRouter } from "@/server/root"

const createCaller = createCallerFactory(appRouter)

export const api = createCaller({ session: null })
