"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CustomerForm } from "@/components/customers/CustomerForm"
import { InteractionTimeline } from "@/components/customers/InteractionTimeline"
import { InteractionForm } from "@/components/customers/InteractionForm"
import { CUSTOMER_STATUS_LABELS } from "@/lib/constants/customer"
import type { z } from "zod"
import type { updateCustomerSchema, addInteractionSchema } from "@/lib/validations/customer.schema"

type UpdateInput = z.infer<typeof updateCustomerSchema>
type AddInteractionInput = z.infer<typeof addInteractionSchema>

const STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  PROSPECT: "warning",
  INACTIVE: "secondary",
}

export default function CustomerDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [editOpen, setEditOpen] = useState(false)
  const [interactionOpen, setInteractionOpen] = useState(false)

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
    },
  })

  function handleUpdate(input: UpdateInput) {
    updateMutation.mutate({ ...input, id })
  }

  function handleAddInteraction(input: AddInteractionInput) {
    addInteractionMutation.mutate(input)
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
            {CUSTOMER_STATUS_LABELS[customer.status]}
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
              <InteractionForm
                customerId={id}
                onSubmit={handleAddInteraction}
                isLoading={addInteractionMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
        <InteractionTimeline interactions={customer.interactions} />
      </div>
    </div>
  )
}
