"use client"

import { useCart } from "@/lib/cart-context"
import { CartItemComponent } from "@/components/cart-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { state } = useCart()
  const router = useRouter()

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-8">Découvrez nos produits et ajoutez-les à votre panier.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuer les achats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Mon Panier</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => (
                <CartItemComponent key={item.productId} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Articles ({state.itemCount})</span>
                      <span>{state.total.toLocaleString()} GNF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className="text-primary">Gratuite</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{state.total.toLocaleString()} GNF</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link href="/checkout">
                      <Button size="lg" className="w-full">
                        Passer la commande
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" size="lg" className="w-full bg-transparent">
                        Continuer les achats
                      </Button>
                    </Link>
                  </div>

                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">Paiement à la livraison</p>
                    <p>Vous paierez lors de la réception de votre commande.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
