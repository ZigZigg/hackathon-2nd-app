"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/client"
import type { EventStatusType } from "@/lib/validations/event.schema"
import type { z } from "zod"
import type { createEventSchema } from "@/lib/validations/event.schema"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EventForm } from "@/components/events/EventForm"
import { EventCalendar } from "@/components/events/EventCalendar"
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VARIANTS,
  EVENT_TYPE_LABELS,
} from "@/lib/constants/event"
import { CalendarDays, List, ChevronLeft, ChevronRight } from "lucide-react"

type CreateInput = z.infer<typeof createEventSchema>

export default function EventsPage() {
  const router = useRouter()
  const [view, setView] = useState<"list" | "calendar">("list")
  const [status, setStatus] = useState<EventStatusType | "all">("all")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)

  const today = new Date()
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())

  const { data, isLoading } = api.events.list.useQuery({
    status: status !== "all" ? status : undefined,
    page,
    pageSize: 20,
  })

  // For calendar view: fetch all events in the current month range
  const calStartDate = new Date(calYear, calMonth, 1)
  const calEndDate = new Date(calYear, calMonth + 1, 0, 23, 59, 59)
  const { data: calData } = api.events.list.useQuery(
    {
      status: status !== "all" ? status : undefined,
      startDate: calStartDate,
      endDate: calEndDate,
      page: 1,
      pageSize: 100,
    },
    { enabled: view === "calendar" }
  )

  const utils = api.useUtils()
  const createMutation = api.events.create.useMutation({
    onSuccess: () => {
      void utils.events.list.invalidate()
      setOpen(false)
    },
  })

  function handleCreate(input: CreateInput) {
    createMutation.mutate(input)
  }

  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 1

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear((y) => y - 1)
    } else {
      setCalMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear((y) => y + 1)
    } else {
      setCalMonth((m) => m + 1)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <EventForm
              mode="create"
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-md border">
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => setView("list")}
          >
            <List className="mr-1 h-4 w-4" />
            List
          </Button>
          <Button
            variant={view === "calendar" ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="mr-1 h-4 w-4" />
            Calendar
          </Button>
        </div>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as EventStatusType | "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PLANNING">Planning</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List View */}
      {view === "list" && (
        <>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Budget
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No events found
                          </td>
                        </tr>
                      ) : (
                        data?.items.map((event) => (
                          <tr
                            key={event.id}
                            className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                            onClick={() => router.push(`/events/${event.id}`)}
                          >
                            <td className="px-4 py-3 font-medium">{event.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Intl.DateTimeFormat("vi-VN").format(new Date(event.date))}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {EVENT_TYPE_LABELS[event.type]}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={EVENT_STATUS_VARIANTS[event.status]}>
                                {EVENT_STATUS_LABELS[event.status]}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground">
                              {event.budget != null
                                ? new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(event.budget)
                                : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-36 text-center font-medium">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <EventCalendar
            events={(calData?.items ?? []).map((e) => ({
              id: e.id,
              name: e.name,
              date: new Date(e.date),
              status: e.status,
            }))}
            month={calMonth}
            year={calYear}
            onEventClick={(id) => router.push(`/events/${id}`)}
          />
        </div>
      )}
    </div>
  )
}
