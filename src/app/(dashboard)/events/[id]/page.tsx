"use client"

import { use } from "react"
import { api } from "@/trpc/client"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TeamAssignment } from "@/components/events/TeamAssignment"
import { QuotationBuilder } from "@/components/events/QuotationBuilder"
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VARIANTS,
  EVENT_TYPE_LABELS,
  VALID_NEXT_STATUSES,
} from "@/lib/constants/event"
import type { EventStatusType } from "@/lib/validations/event.schema"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params)

  const utils = api.useUtils()

  const { data: event, isLoading, isError } = api.events.getById.useQuery({ id })
  const { data: quotation } = api.quotations.getByEvent.useQuery(
    { eventId: id },
    { enabled: !!event }
  )

  const updateStatusMutation = api.events.updateStatus.useMutation({
    onSuccess: () => {
      void utils.events.getById.invalidate({ id })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="p-6">
        <p className="text-destructive">Event not found.</p>
      </div>
    )
  }

  const currentStatus = event.status as EventStatusType
  const validNextStatuses = VALID_NEXT_STATUSES[currentStatus]

  function handleStatusChange(newStatus: string) {
    updateStatusMutation.mutate({ id, status: newStatus as EventStatusType })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <p className="text-sm text-muted-foreground">
            {EVENT_TYPE_LABELS[event.type]} &middot; {new Intl.DateTimeFormat("vi-VN").format(new Date(event.date))}
          </p>
        </div>
        <Badge variant={EVENT_STATUS_VARIANTS[currentStatus]}>
          {EVENT_STATUS_LABELS[currentStatus]}
        </Badge>
      </div>

      {/* Details Card */}
      <Card className="p-4">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Venue</dt>
            <dd className="mt-1 text-sm">{event.venue ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Date</dt>
            <dd className="mt-1 text-sm">
              {new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "full",
              }).format(new Date(event.date))}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Type</dt>
            <dd className="mt-1 text-sm">{EVENT_TYPE_LABELS[event.type]}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Budget</dt>
            <dd className="mt-1 text-sm">
              {event.budget != null
                ? new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(event.budget)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Customer ID</dt>
            <dd className="mt-1 text-sm">{event.customerId ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      {/* Status Change */}
      {validNextStatuses.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Update Status</h3>
          <Select
            onValueChange={handleStatusChange}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Move to..." />
            </SelectTrigger>
            <SelectContent>
              {validNextStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {EVENT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {/* Team Assignment */}
      <Card className="p-4">
        <TeamAssignment
          eventId={id}
          teamMembers={event.teamMembers}
        />
      </Card>

      {/* Quotation Builder */}
      <Card className="p-4">
        <QuotationBuilder
          eventId={id}
          quotationId={quotation?.id ?? null}
          items={quotation?.items ?? []}
          totalAmount={quotation?.totalAmount ?? 0}
        />
      </Card>
    </div>
  )
}
