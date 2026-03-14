import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure, memberProcedure } from "@/server/trpc"
import { db } from "@/server/db"
import {
  createQuotationSchema,
  addItemSchema,
  removeItemSchema,
  updateItemSchema,
} from "@/lib/validations/quotation.schema"

export const quotationsRouter = createTRPCRouter({
  getByEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      const quotation = await db.quotation.findFirst({
        where: { eventId: input.eventId },
        include: {
          items: true,
        },
      })
      return quotation
    }),

  create: memberProcedure
    .input(createQuotationSchema)
    .mutation(async ({ input }) => {
      return db.quotation.create({
        data: {
          eventId: input.eventId,
          totalAmount: 0,
        },
      })
    }),

  addItem: memberProcedure
    .input(addItemSchema)
    .mutation(async ({ input }) => {
      const { quotationId, description, quantity, unitPrice } = input
      const totalPrice = quantity * unitPrice

      const [newItem] = await db.$transaction(async (tx) => {
        const item = await tx.quotationItem.create({
          data: {
            quotationId,
            description,
            quantity,
            unitPrice,
            totalPrice,
          },
        })
        await tx.quotation.update({
          where: { id: quotationId },
          data: {
            totalAmount: { increment: totalPrice },
          },
        })
        return [item]
      })

      return newItem
    }),

  removeItem: memberProcedure
    .input(removeItemSchema)
    .mutation(async ({ input }) => {
      const { itemId } = input

      await db.$transaction(async (tx) => {
        const item = await tx.quotationItem.findUniqueOrThrow({
          where: { id: itemId },
        })

        await tx.quotationItem.delete({ where: { id: itemId } })

        await tx.quotation.update({
          where: { id: item.quotationId },
          data: {
            totalAmount: { decrement: item.totalPrice },
          },
        })
      })

      return { success: true }
    }),

  updateItem: memberProcedure
    .input(updateItemSchema)
    .mutation(async ({ input }) => {
      const { itemId, quantity, unitPrice, description } = input

      try {
        return await db.$transaction(async (tx) => {
          const existingItem = await tx.quotationItem.findUniqueOrThrow({
            where: { id: itemId },
          })

          const newQuantity = quantity ?? existingItem.quantity
          const newUnitPrice = unitPrice ?? existingItem.unitPrice
          const newTotalPrice = newQuantity * newUnitPrice
          const diff = newTotalPrice - existingItem.totalPrice

          const updatedItem = await tx.quotationItem.update({
            where: { id: itemId },
            data: {
              ...(description !== undefined && { description }),
              quantity: newQuantity,
              unitPrice: newUnitPrice,
              totalPrice: newTotalPrice,
            },
          })

          await tx.quotation.update({
            where: { id: existingItem.quotationId },
            data: {
              totalAmount: { increment: diff },
            },
          })

          return updatedItem
        })
      } catch (err) {
        const prismaErr = err as { code?: string }
        if (prismaErr.code === "P2025") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quotation item not found" })
        }
        throw err
      }
    }),
})
