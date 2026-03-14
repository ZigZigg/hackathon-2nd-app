import { z } from "zod"

export const createQuotationSchema = z.object({
  eventId: z.string(),
})

export const addItemSchema = z.object({
  quotationId: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().positive("Unit price must be positive"),
})

export const removeItemSchema = z.object({
  itemId: z.string(),
})

export const updateItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number().positive().optional(),
  description: z.string().min(1).optional(),
})
