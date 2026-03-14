import { config } from "dotenv"
config()

import { PrismaClient, Role, TransactionType } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "" })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create ADMIN user
  const hashedPassword = await bcrypt.hash("admin123!", 12)
  await prisma.user.upsert({
    where: { email: "admin@udika.com" },
    update: {},
    create: {
      email: "admin@udika.com",
      name: "Admin User",
      role: Role.ADMIN,
      hashedPassword,
    },
  })

  // Create default transaction categories
  const categories = [
    { name: "Event Revenue", type: TransactionType.INCOME },
    { name: "Staff Cost", type: TransactionType.EXPENSE },
    { name: "Equipment Rental", type: TransactionType.EXPENSE },
    { name: "Utilities", type: TransactionType.EXPENSE },
    { name: "Marketing", type: TransactionType.EXPENSE },
  ]

  for (const cat of categories) {
    const existing = await prisma.transactionCategory.findFirst({
      where: { name: cat.name },
    })
    if (!existing) {
      await prisma.transactionCategory.create({ data: cat })
    }
  }

  console.log("Seed complete")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
