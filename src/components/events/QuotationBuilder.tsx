"use client"

// TODO: Export to Drive (Phase 6.4 - requires Google Drive service account setup)

import { useState } from "react"
import { api } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

interface QuotationItem {
  id: string
  quotationId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface QuotationBuilderProps {
  eventId: string
  quotationId: string | null
  items: QuotationItem[]
  totalAmount: number
}

export function QuotationBuilder({
  eventId,
  quotationId,
  items,
  totalAmount,
}: QuotationBuilderProps) {
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unitPrice, setUnitPrice] = useState("")

  const utils = api.useUtils()

  const createQuotationMutation = api.quotations.create.useMutation({
    onSuccess: () => {
      void utils.quotations.getByEvent.invalidate({ eventId })
    },
  })

  const addItemMutation = api.quotations.addItem.useMutation({
    onSuccess: () => {
      void utils.quotations.getByEvent.invalidate({ eventId })
      setDescription("")
      setQuantity("1")
      setUnitPrice("")
    },
  })

  const removeItemMutation = api.quotations.removeItem.useMutation({
    onSuccess: () => {
      void utils.quotations.getByEvent.invalidate({ eventId })
    },
  })

  function handleAddItem() {
    if (!description.trim() || !unitPrice || !quotationId) return
    const qty = parseInt(quantity, 10)
    const price = parseFloat(unitPrice)
    if (isNaN(qty) || isNaN(price) || qty < 1 || price <= 0) return

    addItemMutation.mutate({
      quotationId,
      description: description.trim(),
      quantity: qty,
      unitPrice: price,
    })
  }

  if (!quotationId) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Quotation</h3>
        <p className="text-sm text-muted-foreground">No quotation created yet.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => createQuotationMutation.mutate({ eventId })}
          disabled={createQuotationMutation.isPending}
        >
          {createQuotationMutation.isPending ? "Creating..." : "Create Quotation"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Quotation</h3>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Description</th>
              <th className="px-3 py-2 text-right font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Unit Price</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                  No items yet
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      item.unitPrice
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      item.totalPrice
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemMutation.mutate({ itemId: item.id })}
                      disabled={removeItemMutation.isPending}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}

            {/* Add item row */}
            <tr className="border-t bg-muted/30">
              <td className="px-2 py-2">
                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-8 text-sm"
                />
              </td>
              <td className="px-2 py-2">
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-8 w-16 text-right text-sm"
                />
              </td>
              <td className="px-2 py-2">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="h-8 w-28 text-right text-sm"
                />
              </td>
              <td className="px-2 py-2 text-right text-sm text-muted-foreground">
                {unitPrice && quantity
                  ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      parseFloat(unitPrice) * parseInt(quantity, 10)
                    )
                  : "—"}
              </td>
              <td className="px-2 py-2 text-center">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={handleAddItem}
                  disabled={
                    addItemMutation.isPending ||
                    !description.trim() ||
                    !unitPrice ||
                    parseInt(quantity, 10) < 1
                  }
                >
                  Add
                </Button>
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr className="border-t">
              <td colSpan={3} className="px-3 py-2 text-right font-semibold">
                Grand Total
              </td>
              <td className="px-3 py-2 text-right font-bold">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                  totalAmount
                )}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
