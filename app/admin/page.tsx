"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Package, ShoppingCart, TrendingUp, UserPlus, Eye } from "lucide-react"
import Link from "next/link"

interface AdminStats {
  users: {
    total: number
    active: number
    sellers: number
    clients: number
    recent: number
    byRole: Record<string, number>
  }
  products: {
    total: number
    active: number
    recent: number
  }
  orders: {
    total: number
    recent: number
    byStatus: Record<string, number>
  }
  revenue: {
    total: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
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
    if (user.role !== "admin") {
      router.push("/")
      return
    }

    setUser(user)
    await fetchStats(token)
  }

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/admin/stats", {
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
              <h1 className="text-2xl font-bold">Panel Administrateur</h1>
              <p className="text-primary-foreground/80">
                Bienvenue, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="secondary" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le site
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                onClick={() => {
                  localStorage.removeItem("authToken")
                  localStorage.removeItem("user")
                  router.push("/")
                }}
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold text-primary">{stats.users.active}</p>
                  <p className="text-xs text-muted-foreground">sur {stats.users.total} total</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produits</p>
                  <p className="text-2xl font-bold text-primary">{stats.products.active}</p>
                  <p className="text-xs text-muted-foreground">sur {stats.products.total} total</p>
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
                  <p className="text-2xl font-bold text-primary">{stats.orders.total}</p>
                  <p className="text-xs text-muted-foreground">{stats.orders.recent} cette semaine</p>
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
                  <p className="text-2xl font-bold text-primary">{stats.revenue.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">GNF total</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
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
              <Link href="/admin/users/new">
                <Button className="w-full justify-start" size="lg">
                  <UserPlus className="h-5 w-5 mr-3" />
                  Créer un compte vendeur
                </Button>
              </Link>

              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <Users className="h-5 w-5 mr-3" />
                  Gérer les utilisateurs ({stats.users.total})
                </Button>
              </Link>

              <Link href="/admin/products">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <Package className="h-5 w-5 mr-3" />
                  Gérer les produits ({stats.products.total})
                </Button>
              </Link>

              <Link href="/admin/orders">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Gérer les commandes ({stats.orders.total})
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Clients</Badge>
                  </div>
                  <Badge className="bg-blue-500">{stats.users.byRole.client || 0}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Vendeurs</Badge>
                  </div>
                  <Badge className="bg-green-500">{stats.users.byRole.seller || 0}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Administrateurs</Badge>
                  </div>
                  <Badge className="bg-red-500">{stats.users.byRole.admin || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Activité récente (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.users.recent}</p>
                <p className="text-sm text-muted-foreground">Nouveaux utilisateurs</p>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.products.recent}</p>
                <p className="text-sm text-muted-foreground">Nouveaux produits</p>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.orders.recent}</p>
                <p className="text-sm text-muted-foreground">Nouvelles commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Overview */}
        {Object.keys(stats.orders.byStatus).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>État des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.orders.byStatus).map(([status, count]) => (
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
