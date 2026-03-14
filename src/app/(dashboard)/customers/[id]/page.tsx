"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/trpc/client"
import type { InteractionTypeType } from "@/lib/validations/customer.schema"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { CustomerForm } from "@/components/customers/CustomerForm"
import { InteractionTimeline } from "@/components/customers/InteractionTimeline"
import type { z } from "zod"
import type { updateCustomerSchema } from "@/lib/validations/customer.schema"

type UpdateInput = z.infer<typeof updateCustomerSchema>

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PROSPECT: "Prospect",
  INACTIVE: "Inactive",
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  PROSPECT: "warning",
  INACTIVE: "secondary",
}

const INTERACTION_TYPES: InteractionTypeType[] = ["CALL", "MEETING", "MESSAGE", "OTHER"]
const INTERACTION_LABELS: Record<InteractionTypeType, string> = {
  CALL: "Call",
  MEETING: "Meeting",
  MESSAGE: "Message",
  OTHER: "Other",
}

export default function CustomerDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [editOpen, setEditOpen] = useState(false)
  const [interactionOpen, setInteractionOpen] = useState(false)
  const [interactionType, setInteractionType] = useState<InteractionTypeType>("CALL")
  const [interactionNotes, setInteractionNotes] = useState("")

  const { data: customer, isLoading, isError } = api.customers.getById.useQuery({ id })

  const utils = api.useUtils()

  const updateMutation = api.customers.update.useMutation({
    onSuccess: () => {
      void utils.customers.getById.invalidate({ id })
      setEditOpen(false)
    },
  })

  const addInteractionMutation = api.customers.addInteraction.useMutation({
    onSuccess: () => {
      void utils.customers.getById.invalidate({ id })
      setInteractionOpen(false)
      setInteractionNotes("")
      setInteractionType("CALL")
    },
  })

  function handleUpdate(input: UpdateInput) {
    updateMutation.mutate({ ...input, id })
  }

  function handleAddInteraction(e: React.FormEvent) {
    e.preventDefault()
    if (!interactionNotes.trim()) return
    addInteractionMutation.mutate({
      customerId: id,
      type: interactionType,
      notes: interactionNotes,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <p className="text-sm text-destructive">Customer not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <Badge variant={STATUS_VARIANTS[customer.status]}>
            {STATUS_LABELS[customer.status]}
          </Badge>
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              mode="edit"
              defaultValues={{
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email ?? "",
                company: customer.company ?? "",
                address: customer.address ?? "",
                status: customer.status,
              }}
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Phone</p>
            <p className="text-sm">{customer.phone}</p>
          </div>
          {customer.email && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{customer.email}</p>
            </div>
          )}
          {customer.company && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Company</p>
              <p className="text-sm">{customer.company}</p>
            </div>
          )}
          {customer.address && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Address</p>
              <p className="text-sm">{customer.address}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Interaction History</h2>
          <Dialog open={interactionOpen} onOpenChange={setInteractionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Log Interaction</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Interaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddInteraction} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={interactionType}
                    onValueChange={(v) => setInteractionType(v as InteractionTypeType)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERACTION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {INTERACTION_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="notes">Notes *</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe what happened..."
                    value={interactionNotes}
                    onChange={(e) => setInteractionNotes(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addInteractionMutation.isPending || !interactionNotes.trim()}
                >
                  {addInteractionMutation.isPending ? "Saving..." : "Log Interaction"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <InteractionTimeline interactions={customer.interactions} />
      </div>
    </div>
  )
}
