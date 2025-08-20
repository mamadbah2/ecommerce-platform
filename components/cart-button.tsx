"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

export function CartButton() {
  const { state } = useCart()

  return (
    <Link href="/cart">
      <Button variant="outline" size="sm" className="relative bg-transparent">
        <ShoppingCart className="h-4 w-4 mr-2" />
        Panier
        {state.itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {state.itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}
