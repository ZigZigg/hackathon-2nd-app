"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/client"
import type { CustomerStatusType } from "@/lib/validations/customer.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { CustomerForm } from "@/components/customers/CustomerForm"
import { CUSTOMER_STATUS_LABELS } from "@/lib/constants/customer"
import type { z } from "zod"
import type { createCustomerSchema } from "@/lib/validations/customer.schema"

type CreateInput = z.infer<typeof createCustomerSchema>

const STATUS_VARIANTS: Record<CustomerStatusType, "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  PROSPECT: "warning",
  INACTIVE: "secondary",
}

export default function CustomersPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState<CustomerStatusType | "all">("all")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const { data, isLoading } = api.customers.list.useQuery({
    search: debouncedSearch || undefined,
    status: status !== "all" ? status : undefined,
    page,
    pageSize: 20,
  })

  const utils = api.useUtils()
  const createMutation = api.customers.create.useMutation({
    onSuccess: () => {
      void utils.customers.list.invalidate()
      setOpen(false)
    },
  })

  function handleCreate(input: CreateInput) {
    createMutation.mutate(input)
  }

  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 1

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              mode="create"
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as CustomerStatusType | "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PROSPECT">Prospect</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Company</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    data?.items.map((customer) => (
                      <tr
                        key={customer.id}
                        className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                        onClick={() => router.push(`/customers/${customer.id}`)}
                      >
                        <td className="px-4 py-3 font-medium">{customer.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{customer.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground">{customer.company ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANTS[customer.status]}>
                            {CUSTOMER_STATUS_LABELS[customer.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Intl.DateTimeFormat("vi-VN").format(new Date(customer.createdAt))}
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
    </div>
  )
}
