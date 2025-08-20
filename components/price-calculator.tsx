"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { calculateProductPrice } from "@/lib/mock-data"

interface PriceCalculatorProps {
  product: Product
  onQuantityChange: (quantity: number, price: number) => void
}

export function PriceCalculator({ product, onQuantityChange }: PriceCalculatorProps) {
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(product.priceTiers[0].price)
  const [totalPrice, setTotalPrice] = useState(product.priceTiers[0].price)

  useEffect(() => {
    const newUnitPrice = calculateProductPrice(product, quantity)
    const newTotalPrice = newUnitPrice * quantity
    setUnitPrice(newUnitPrice)
    setTotalPrice(newTotalPrice)
    onQuantityChange(quantity, newUnitPrice)
  }, [quantity, product, onQuantityChange])

  const handleQuantityChange = (value: string) => {
    const newQuantity = Math.max(1, Math.min(product.stock, Number.parseInt(value) || 1))
    setQuantity(newQuantity)
  }

  const getCurrentTier = () => {
    return product.priceTiers.find(
      (tier) => quantity >= tier.minQuantity && (tier.maxQuantity === undefined || quantity <= tier.maxQuantity),
    )
  }

  const currentTier = getCurrentTier()

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="quantity" className="text-base font-semibold">
              Quantité
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">{product.stock} articles disponibles</p>
          </div>

          {currentTier && (
            <div className="bg-secondary/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-primary text-primary">
                  {currentTier.minQuantity}
                  {currentTier.maxQuantity ? `-${currentTier.maxQuantity}` : "+"} pièces
                </Badge>
                {quantity >= 10 && <Badge className="bg-primary">Prix de gros</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Prix unitaire pour cette quantité: {unitPrice.toLocaleString()} GNF
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base">Prix unitaire:</span>
              <span className="text-lg font-semibold text-primary">{unitPrice.toLocaleString()} GNF</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()} GNF</span>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Tarifs dégressifs:</h4>
            <div className="space-y-1">
              {product.priceTiers.map((tier, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {tier.minQuantity}
                    {tier.maxQuantity ? `-${tier.maxQuantity}` : "+"} pièces:
                  </span>
                  <span className="font-medium">{tier.price.toLocaleString()} GNF</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
