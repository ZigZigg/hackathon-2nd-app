import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { appRouter } from "@/server/root"
import { type Context } from "@/server/trpc"

const handler = async (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      const session = await auth()
      return { session }
    },
  })

export { handler as GET, handler as POST }
