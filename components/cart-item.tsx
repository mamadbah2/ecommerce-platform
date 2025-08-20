"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { calculateProductPrice } from "@/lib/mock-data"
import type { CartItem } from "@/lib/types"

interface CartItemProps {
  item: CartItem
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    if (!item.product) return

    const maxQuantity = item.product.stock
    const validQuantity = Math.max(1, Math.min(maxQuantity, newQuantity))
    const newPrice = calculateProductPrice(item.product, validQuantity)
    updateQuantity(item.productId, validQuantity, newPrice)
  }

  const handleRemove = () => {
    removeFromCart(item.productId)
  }

  if (!item.product) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
            <Image
              src={item.product.images[0] || "/placeholder.svg?height=80&width=80"}
              alt={item.product.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{item.product.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{item.product.category}</p>
            <p className="text-lg font-bold text-primary">{item.selectedPrice.toLocaleString()} GNF / unité</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>

              <Input
                type="number"
                min="1"
                max={item.product.stock}
                value={item.quantity}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                className="w-16 text-center"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= item.product.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <p className="text-lg font-bold">{(item.quantity * item.selectedPrice).toLocaleString()} GNF</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
