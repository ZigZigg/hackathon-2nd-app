import type { EventStatusType, EventTypeType } from "@/lib/validations/event.schema"

export const EVENT_STATUS_LABELS: Record<EventStatusType, string> = {
  PLANNING: "Planning",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

export const EVENT_STATUS_VARIANTS: Record<
  EventStatusType,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  PLANNING: "secondary",
  CONFIRMED: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
}

export const EVENT_TYPE_LABELS: Record<EventTypeType, string> = {
  WEDDING: "Wedding",
  CORPORATE: "Corporate",
  BIRTHDAY: "Birthday",
  OTHER: "Other",
}

// Valid next states from each state
export const VALID_NEXT_STATUSES: Record<EventStatusType, EventStatusType[]> = {
  PLANNING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
}
