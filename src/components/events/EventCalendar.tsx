"use client"

import { cn } from "@/lib/utils"
import { EVENT_STATUS_VARIANTS } from "@/lib/constants/event"
import type { EventStatusType } from "@/lib/validations/event.schema"

interface CalendarEvent {
  id: string
  name: string
  date: Date
  status: EventStatusType
}

interface EventCalendarProps {
  events: CalendarEvent[]
  month: number // 0-indexed (0 = January)
  year: number
  onEventClick?: (eventId: string) => void
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const STATUS_COLOR_CLASSES: Record<EventStatusType, string> = {
  PLANNING: "bg-secondary text-secondary-foreground",
  CONFIRMED: "bg-primary text-primary-foreground",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-destructive/10 text-destructive",
}

export function EventCalendar({ events, month, year, onEventClick }: EventCalendarProps) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Get day of week for first day (Mon=0, Sun=6)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7

  // Build grid cells: leading empty cells + day cells
  const totalCells = startDayOfWeek + daysInMonth
  const rows = Math.ceil(totalCells / 7)

  // Map events to their day
  const eventsByDay = new Map<number, CalendarEvent[]>()
  for (const event of events) {
    const d = new Date(event.date)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      const existing = eventsByDay.get(day) ?? []
      eventsByDay.set(day, [...existing, event])
    }
  }

  const cells: Array<number | null> = [
    ...Array.from<null>({ length: startDayOfWeek }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array.from<null>({ length: rows * 7 - totalCells }).fill(null),
  ]

  const hasAnyEvent = events.some((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === year && d.getMonth() === month
  })

  return (
    <div className="rounded-lg border bg-card">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              "min-h-20 border-b border-r p-1 last:border-r-0",
              day === null && "bg-muted/30"
            )}
          >
            {day !== null && (
              <>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  {day}
                </span>
                <div className="space-y-0.5">
                  {(eventsByDay.get(day) ?? []).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onEventClick?.(event.id)}
                      className={cn(
                        "w-full truncate rounded px-1 py-0.5 text-left text-xs transition-opacity hover:opacity-80",
                        STATUS_COLOR_CLASSES[event.status]
                      )}
                      title={event.name}
                    >
                      {event.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!hasAnyEvent && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No events this month
        </div>
      )}
    </div>
  )
}

// Re-export the variant helper for use in other components
export { EVENT_STATUS_VARIANTS }
