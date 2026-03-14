import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { Prisma } from "@prisma/client"
import { createTRPCRouter, protectedProcedure, memberProcedure, adminProcedure } from "@/server/trpc"
import { db } from "@/server/db"
import {
  createEventSchema,
  updateEventSchema,
  updateStatusSchema,
  assignTeamSchema,
  listEventsSchema,
  type EventStatusType,
} from "@/lib/validations/event.schema"

// State machine: valid next states for each current state
const VALID_TRANSITIONS: Record<EventStatusType, EventStatusType[]> = {
  PLANNING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
}

export const eventsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listEventsSchema)
    .query(async ({ input }) => {
      const { status, startDate, endDate, page, pageSize } = input
      const skip = (page - 1) * pageSize

      const where: Prisma.EventWhereInput = {}

      if (status) {
        where.status = status
      }

      if (startDate || endDate) {
        where.date = {}
        if (startDate) {
          where.date.gte = startDate
        }
        if (endDate) {
          where.date.lte = endDate
        }
      }

      const [items, totalCount] = await Promise.all([
        db.event.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { date: "asc" },
        }),
        db.event.count({ where }),
      ])

      return { items, totalCount, page, pageSize }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const event = await db.event.findUniqueOrThrow({
          where: { id: input.id },
          include: {
            teamMembers: true,
            quotations: {
              include: {
                items: true,
              },
            },
          },
        })
        return event
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" })
      }
    }),

  create: memberProcedure
    .input(createEventSchema)
    .mutation(async ({ input }) => {
      return db.event.create({
        data: {
          ...input,
          status: "PLANNING",
        },
      })
    }),

  update: memberProcedure
    .input(updateEventSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      try {
        return await db.event.update({
          where: { id },
          data,
        })
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" })
        }
        throw err
      }
    }),

  updateStatus: memberProcedure
    .input(updateStatusSchema)
    .mutation(async ({ input }) => {
      const { id, status: newStatus } = input

      let currentEvent: { status: EventStatusType }
      try {
        currentEvent = await db.event.findUniqueOrThrow({
          where: { id },
          select: { status: true },
        })
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" })
      }

      const currentStatus = currentEvent.status as EventStatusType
      const allowedNext = VALID_TRANSITIONS[currentStatus]

      if (!allowedNext.includes(newStatus)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot transition from ${currentStatus} to ${newStatus}`,
        })
      }

      return db.event.update({
        where: { id },
        data: { status: newStatus },
      })
    }),

  assignTeam: memberProcedure
    .input(assignTeamSchema)
    .mutation(async ({ input }) => {
      const { eventId, userId, role, isCollaborator } = input

      try {
        const existing = await db.eventTeamMember.findFirst({
          where: { eventId, userId },
        })

        if (existing) {
          return await db.eventTeamMember.update({
            where: { id: existing.id },
            data: { role, isCollaborator },
          })
        }

        return await db.eventTeamMember.create({
          data: {
            eventId,
            userId,
            role,
            isCollaborator,
          },
        })
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2003") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "User not found" })
          }
          if (err.code === "P2025") {
            throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" })
          }
        }
        throw err
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await db.event.delete({ where: { id: input.id } })
        return { success: true }
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" })
        }
        throw err
      }
    }),
})
