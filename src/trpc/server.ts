import "server-only"
import { createCallerFactory } from "@trpc/server"
import { cache } from "react"
import { auth } from "@/lib/auth"
import { appRouter } from "@/server/root"

const createCaller = createCallerFactory(appRouter)

export const api = cache(async () => {
  const session = await auth()
  return createCaller({ session })
})
