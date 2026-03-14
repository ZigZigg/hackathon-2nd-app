import { z } from "zod"

export const CustomerStatusEnum = z.enum(["ACTIVE", "PROSPECT", "INACTIVE"])
export const InteractionTypeEnum = z.enum(["CALL", "MEETING", "MESSAGE", "OTHER"])

export type CustomerStatusType = z.infer<typeof CustomerStatusEnum>
export type InteractionTypeType = z.infer<typeof InteractionTypeEnum>

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company: z.string().optional(),
  address: z.string().optional(),
  status: CustomerStatusEnum.default("PROSPECT"),
})

export const updateCustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company: z.string().optional(),
  address: z.string().optional(),
  status: CustomerStatusEnum.optional(),
})

export const addInteractionSchema = z.object({
  customerId: z.string(),
  type: InteractionTypeEnum,
  notes: z.string().min(1, "Notes are required"),
})

export const listCustomersSchema = z.object({
  search: z.string().optional(),
  status: CustomerStatusEnum.optional(),
  assignedStaffId: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
})
