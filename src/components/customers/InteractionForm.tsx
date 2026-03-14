"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { addInteractionSchema, type InteractionTypeType } from "@/lib/validations/customer.schema"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { INTERACTION_TYPE_LABELS } from "@/lib/constants/customer"

type AddInteractionInput = z.infer<typeof addInteractionSchema>

const INTERACTION_TYPES: InteractionTypeType[] = ["CALL", "MEETING", "MESSAGE", "OTHER"]

interface InteractionFormProps {
  customerId: string
  onSubmit: (data: AddInteractionInput) => void
  isLoading?: boolean
}

export function InteractionForm({ customerId, onSubmit, isLoading }: InteractionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddInteractionInput>({
    resolver: zodResolver(addInteractionSchema),
    defaultValues: {
      customerId,
      type: "CALL",
      notes: "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("customerId")} />
      <div className="space-y-1">
        <Label htmlFor="type">Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {INTERACTION_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes *</Label>
        <Textarea
          id="notes"
          placeholder="Describe what happened..."
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Log Interaction"}
      </Button>
    </form>
  )
}
