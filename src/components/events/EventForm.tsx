"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { createEventSchema, updateEventSchema, EventTypeEnum } from "@/lib/validations/event.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EVENT_TYPE_LABELS } from "@/lib/constants/event"

type CreateInput = z.infer<typeof createEventSchema>
type UpdateInput = z.infer<typeof updateEventSchema>

interface EventFormCreateProps {
  mode: "create"
  onSubmit: (data: CreateInput) => void
  isLoading?: boolean
}

interface EventFormEditProps {
  mode: "edit"
  defaultValues: UpdateInput
  onSubmit: (data: UpdateInput) => void
  isLoading?: boolean
}

type EventFormProps = EventFormCreateProps | EventFormEditProps

export function EventForm(props: EventFormProps) {
  const isEdit = props.mode === "edit"

  const createForm = useForm<CreateInput>({
    resolver: zodResolver(createEventSchema),
  })

  const editForm = useForm<UpdateInput>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: isEdit ? (props as EventFormEditProps).defaultValues : undefined,
  })

  const form = isEdit ? editForm : createForm

  function handleSubmit(data: CreateInput | UpdateInput) {
    if (props.mode === "create") {
      props.onSubmit(data as CreateInput)
    } else {
      props.onSubmit(data as UpdateInput)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          placeholder="e.g. Smith & Jones Wedding"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          {...form.register("date")}
        />
        {form.formState.errors.date && (
          <p className="text-sm text-destructive">{String(form.formState.errors.date.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input
          id="venue"
          placeholder="e.g. Grand Ballroom, Hotel Metropole"
          {...form.register("venue")}
        />
        {form.formState.errors.venue && (
          <p className="text-sm text-destructive">{form.formState.errors.venue.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Event Type</Label>
        <Select
          onValueChange={(v) => form.setValue("type", v as z.infer<typeof EventTypeEnum>)}
          defaultValue={isEdit ? (props as EventFormEditProps).defaultValues?.type : undefined}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {EventTypeEnum.options.map((type) => (
              <SelectItem key={type} value={type}>
                {EVENT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.type && (
          <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budget (optional)</Label>
        <Input
          id="budget"
          type="number"
          min={0}
          step={0.01}
          placeholder="e.g. 50000"
          {...form.register("budget", { valueAsNumber: true })}
        />
        {form.formState.errors.budget && (
          <p className="text-sm text-destructive">{form.formState.errors.budget.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerId">Customer ID (optional)</Label>
        <Input
          id="customerId"
          placeholder="Customer ID"
          {...form.register("customerId")}
        />
      </div>

      <Button type="submit" className="w-full" disabled={props.isLoading}>
        {props.isLoading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
      </Button>
    </form>
  )
}
