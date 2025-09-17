"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User as UserIcon, Package, ShoppingCart, Calendar, Mail, Phone, MapPin, Edit, Activity } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { User } from "@/lib/types"

interface UserProduct {
  _id: string
  name: string
  description: string
  images: string[]
  category: string
  stock: number
  isActive: boolean
  createdAt: string
  priceTiers: Array<{
    minQuantity: number
    maxQuantity?: number
    price: number
  }>
}

interface UserOrder {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
}

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [fetchLoading, setFetchLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [userProducts, setUserProducts] = useState<UserProduct[]>([])
  const [userOrders, setUserOrders] = useState<UserOrder[]>([])
  const [error, setError] = useState<string>("")

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const checkAuth = () => {
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
  }

  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      // Fetch user info
      const userResponse = await fetch(`/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        const targetUser = userData.users.find((u: any) => u.id === userId || u._id === userId)
        
        if (targetUser) {
          setUser(targetUser)
          
          // If user is a seller, fetch their products
          if (targetUser.role === "seller") {
            await fetchUserProducts(token, targetUser.id || targetUser._id)
          }
          
          // Fetch user orders (if user is a client)
          if (targetUser.role === "client") {
            await fetchUserOrders(token, targetUser.id || targetUser._id)
          }
        } else {
          setError("Utilisateur non trouvé")
        }
      } else {
        setError("Erreur lors du chargement de l'utilisateur")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Erreur de connexion")
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchUserProducts = async (token: string, sellerId: string) => {
    try {
      const response = await fetch(`/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const sellerProducts = data.products.filter((p: any) => p.sellerId === sellerId)
        setUserProducts(sellerProducts)
      }
    } catch (error) {
      console.error("Error fetching user products:", error)
    }
  }

  const fetchUserOrders = async (token: string, clientId: string) => {
    try {
      const response = await fetch(`/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const clientOrders = data.orders.filter((o: any) => o.userId === clientId)
        setUserOrders(clientOrders)
      }
    } catch (error) {
      console.error("Error fetching user orders:", error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "seller":
        return "bg-green-500"
      case "client":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg">Chargement des détails de l'utilisateur...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link href="/admin/users">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux utilisateurs
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Erreur</h1>
            </div>

            {/* Error Message */}
            <div className="text-center py-12">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-destructive font-medium">{error}</p>
                <div className="mt-4">
                  <Link href="/admin/users">
                    <Button variant="outline">
                      Retour à la liste des utilisateurs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/users">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux utilisateurs
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Détails de l'utilisateur</h1>
                <p className="text-muted-foreground">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <Link href={`/admin/users/${user.id || (user as any)._id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
          </div>

          {/* User Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-xl">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                    <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg md:col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p className="font-medium">{user.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Statut du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={user.isActive ? "default" : "secondary"} className="mt-1">
                    {user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Membre depuis</p>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Dernière modification</p>
                  <p className="font-medium">
                    {new Date(user.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role-specific content */}
          {user.role === "seller" && (
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produits ({userProducts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Produits du vendeur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Aucun produit créé</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userProducts.map((product) => (
                          <Card key={product._id} className={`${!product.isActive ? "opacity-60" : ""}`}>
                            <CardContent className="p-4">
                              <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={product.images[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                                <Badge
                                  variant={product.isActive ? "default" : "secondary"}
                                  className="absolute top-2 right-2"
                                >
                                  {product.isActive ? "Actif" : "Inactif"}
                                </Badge>
                              </div>
                              
                              <h3 className="font-medium mb-1">{product.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {product.description}
                              </p>
                              <div className="flex justify-between items-center">
                                <Badge variant="outline">{product.category}</Badge>
                                <span className="text-sm font-medium">
                                  {product.stock} en stock
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {user.role === "client" && (
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Commandes ({userOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Historique des commandes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Aucune commande passée</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userOrders.map((order) => (
                          <Card key={order.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-medium">Commande #{order.id.slice(-8)}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge className={getStatusBadgeColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                  <p className="text-sm font-medium mt-1">
                                    {order.totalAmount.toLocaleString()} $
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{item.productName} x{item.quantity}</span>
                                    <span>{(item.price * item.quantity).toLocaleString()} $</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
