"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { createCustomerSchema, updateCustomerSchema, type CustomerStatusType } from "@/lib/validations/customer.schema"
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
import { cn } from "@/lib/utils"

type CreateInput = z.infer<typeof createCustomerSchema>
type UpdateInput = z.infer<typeof updateCustomerSchema>

interface CustomerFormProps {
  mode: "create" | "edit"
  defaultValues?: Partial<UpdateInput>
  onSubmit: (data: CreateInput | UpdateInput) => void
  isLoading?: boolean
}

const STATUS_LABELS: Record<CustomerStatusType, string> = {
  ACTIVE: "Active",
  PROSPECT: "Prospect",
  INACTIVE: "Inactive",
}

const STATUS_VALUES: CustomerStatusType[] = ["ACTIVE", "PROSPECT", "INACTIVE"]

export function CustomerForm({ mode, defaultValues, onSubmit, isLoading }: CustomerFormProps) {
  const schema = mode === "create" ? createCustomerSchema : updateCustomerSchema
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "PROSPECT",
      ...defaultValues,
    } as CreateInput,
  })

  const statusValue = watch("status")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Customer name"
          className={cn(errors.name && "border-destructive")}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          placeholder="Phone number"
          className={cn(errors.phone && "border-destructive")}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email address (optional)"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="company">Company</Label>
        <Input id="company" placeholder="Company (optional)" {...register("company")} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="Address (optional)" {...register("address")} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <Select
          value={statusValue}
          onValueChange={(v) => setValue("status", v as CustomerStatusType)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : mode === "create" ? "Create Customer" : "Save Changes"}
      </Button>
    </form>
  )
}
