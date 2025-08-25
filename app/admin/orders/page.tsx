"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { ArrowLeft, Search, Eye, Package } from "lucide-react"
import Link from "next/link"
import type { Order, OrderStatus } from "@/lib/types"

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

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, selectedStatus])

  const checkAuth = async () => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== "admin") {
      router.push("/")
      return
    }

    await fetchOrders(token)
  }

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        console.error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedStatus) {
      filtered = filtered.filter((order) => order.status === selectedStatus)
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          deliveredAt: newStatus === "delivered" ? new Date().toISOString() : undefined,
        }),
      })

      if (response.ok) {
        await fetchOrders(token)
      } else {
        alert("Erreur lors de la mise à jour du statut")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Erreur de connexion")
    }
  }

  const statuses = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Chargement des commandes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par numéro ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(null)}
            >
              Tous les statuts
            </Button>
            {statuses.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                <OrderStatusBadge status={status as any} />
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredOrders.length} commande{filteredOrders.length !== 1 ? "s" : ""} trouvée
            {filteredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mb-4">
                {orders.length === 0 ? "Aucune commande" : "Aucune commande trouvée"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Commande #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Client: {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Commandé le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-lg font-bold text-primary mt-2">{order.totalAmount.toLocaleString()} GNF</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.product?.name || "Produit inconnu"}</p>
                            <p className="text-sm text-muted-foreground">
                              Vendeur: {item.product?.seller?.firstName} {item.product?.seller?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantity} × {item.unitPrice} GNF
                            </p>
                          </div>
                          <p className="font-semibold">{item.totalPrice} GNF</p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmée</SelectItem>
                            <SelectItem value="preparing">En préparation</SelectItem>
                            <SelectItem value="shipped">Expédiée</SelectItem>
                            <SelectItem value="delivered">Livrée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
