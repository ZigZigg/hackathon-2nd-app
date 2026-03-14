import { z } from "zod"

export const EventStatusEnum = z.enum([
  "PLANNING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
])

export const EventTypeEnum = z.enum(["WEDDING", "CORPORATE", "BIRTHDAY", "OTHER"])

export type EventStatusType = z.infer<typeof EventStatusEnum>
export type EventTypeType = z.infer<typeof EventTypeEnum>

export const createEventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.coerce.date(),
  venue: z.string().min(1, "Venue is required"),
  type: EventTypeEnum,
  budget: z.number().positive("Budget must be positive").optional(),
  customerId: z.string().optional(),
})

export const updateEventSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
  venue: z.string().min(1).optional(),
  type: EventTypeEnum.optional(),
  budget: z.number().positive().optional(),
  customerId: z.string().optional(),
})

export const updateStatusSchema = z.object({
  id: z.string(),
  status: EventStatusEnum,
})

export const assignTeamSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  role: z.string().min(1, "Role is required"),
  isCollaborator: z.boolean().default(false),
})

export const listEventsSchema = z.object({
  status: EventStatusEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})
