import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure, memberProcedure, adminProcedure } from "@/server/trpc"
import { db } from "@/server/db"
import {
  createCustomerSchema,
  updateCustomerSchema,
  addInteractionSchema,
  listCustomersSchema,
} from "@/lib/validations/customer.schema"

export const customersRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listCustomersSchema)
    .query(async ({ input }) => {
      const { search, status, assignedStaffId, page, pageSize } = input
      const skip = (page - 1) * pageSize

      const where: Record<string, unknown> = {}

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ]
      }

      if (status) {
        where.status = status
      }

      if (assignedStaffId) {
        where.assignedStaffId = assignedStaffId
      }

      const [items, totalCount] = await Promise.all([
        db.customer.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        db.customer.count({ where }),
      ])

      return { items, totalCount, page, pageSize }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const customer = await db.customer.findUniqueOrThrow({
          where: { id: input.id },
          include: {
            interactions: {
              orderBy: { createdAt: "desc" },
            },
          },
        })
        return customer
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" })
      }
    }),

  create: memberProcedure
    .input(createCustomerSchema)
    .mutation(async ({ input }) => {
      return db.customer.create({
        data: input,
      })
    }),

  update: memberProcedure
    .input(updateCustomerSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return db.customer.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.customer.delete({ where: { id: input.id } })
      return { success: true }
    }),

  addInteraction: memberProcedure
    .input(addInteractionSchema)
    .mutation(async ({ input, ctx }) => {
      return db.customerInteraction.create({
        data: {
          customerId: input.customerId,
          type: input.type,
          notes: input.notes,
          staffId: ctx.session.user.id,
        },
      })
    }),
})
