"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, TrendingUp, Eye, Plus, Settings } from "lucide-react"
import Link from "next/link"

interface SellerStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalRevenue: number
  ordersByStatus: Record<string, number>
  topProducts: Array<{ product: string; quantity: number }>
}

export default function SellerDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== "seller" && user.role !== "admin") {
      router.push("/")
      return
    }

    setUser(user)
    await fetchStats(token)
  }

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/seller/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        console.error("Failed to fetch stats")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Erreur de chargement</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Vendeur</h1>
              <p className="text-primary-foreground/80">
                Bienvenue, {user.firstName} {user.lastName}
              </p>
            </div>
            
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produits actifs</p>
                  <p className="text-2xl font-bold text-primary">{stats.activeProducts}</p>
                  <p className="text-xs text-muted-foreground">sur {stats.totalProducts} total</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commandes</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">GNF</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.ordersByStatus.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">commandes</p>
                </div>
                <Settings className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/seller/products/new">
                <Button className="w-full justify-start" size="lg">
                  <Plus className="h-5 w-5 mr-3" />
                  Ajouter un nouveau produit
                </Button>
              </Link>

              <Link href="/seller/products">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <Package className="h-5 w-5 mr-3" />
                  Gérer mes produits ({stats.totalProducts})
                </Button>
              </Link>

              <Link href="/seller/orders">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Voir les commandes ({stats.totalOrders})
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produits les plus vendus</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.topProducts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{item.product}</span>
                      </div>
                      <Badge className="bg-primary">{item.quantity} vendus</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune vente pour le moment</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Status Overview */}
        {Object.keys(stats.ordersByStatus).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>État des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
