"use client"

import type { ReactNode } from "react"
import { Phone, Users, MessageSquare, CircleDot } from "lucide-react"
import type { InteractionTypeType } from "@/lib/validations/customer.schema"
import { INTERACTION_TYPE_LABELS } from "@/lib/constants/customer"

interface Interaction {
  id: string
  type: InteractionTypeType
  notes: string
  // TODO: staffId is a plain string without a User relation in the current schema.
  // When a staff relation is added to CustomerInteraction, replace with staff?: { id: string; name: string } | null
  staffId: string | null
  createdAt: Date | string
}

interface InteractionTimelineProps {
  interactions: Interaction[]
}

const INTERACTION_ICONS: Record<InteractionTypeType, ReactNode> = {
  CALL: <Phone className="size-4" />,
  MEETING: <Users className="size-4" />,
  MESSAGE: <MessageSquare className="size-4" />,
  OTHER: <CircleDot className="size-4" />,
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  if (interactions.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No interactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction) => (
        <div key={interaction.id} className="flex gap-3 rounded-lg border p-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {INTERACTION_ICONS[interaction.type]}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{INTERACTION_TYPE_LABELS[interaction.type]}</span>
              <span className="text-xs text-muted-foreground">{formatDate(interaction.createdAt)}</span>
            </div>
            {interaction.staffId && (
              <p className="text-xs text-muted-foreground">Staff: {interaction.staffId}</p>
            )}
            <p className="text-sm">{interaction.notes}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
