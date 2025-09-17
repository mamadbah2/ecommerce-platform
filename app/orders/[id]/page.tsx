"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { OrderTimeline } from "@/components/order-timeline"
import { ArrowLeft, MapPin, Phone, User, Package } from "lucide-react"
import type { Order } from "@/lib/types"

interface OrderWithDetails extends Order {
  user?: any
  items: Array<{
    id: string
    productId: string
    product?: any
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        router.push("/")
        return
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        router.push("/orders")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      router.push("/orders")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Chargement de la commande...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Commande non trouvée</p>
            <Button onClick={() => router.push("/orders")} className="mt-4">
              Retour aux commandes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.push("/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Mes commandes
            </Button>
            <h1 className="text-3xl font-bold">Commande #{order.id}</h1>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Suivi de commande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline
                  currentStatus={order.status}
                  createdAt={new Date(order.createdAt)}
                  deliveredAt={order.deliveredAt ? new Date(order.deliveredAt) : undefined}
                />
              </CardContent>
            </Card>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Shipping Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informations de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                    <p>{order.phone}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <p>{order.shippingAddress}</p>
                  </div>

                  {order.notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Paiement à la livraison</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Vous paierez {order.totalAmount.toLocaleString()} $ lors de la réception de votre commande.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aucun paiement en ligne n'est requis pour cette commande.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order Items */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product?.name || "Produit inconnu"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.product?.category} • Vendeur: {item.product?.seller?.firstName}{" "}
                        {item.product?.seller?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {item.unitPrice.toLocaleString()} $
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{item.totalPrice.toLocaleString()} $</p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{order.totalAmount.toLocaleString()} $</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
