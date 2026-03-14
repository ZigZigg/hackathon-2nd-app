import path from "path"
import { defineConfig } from "prisma/config"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
})
