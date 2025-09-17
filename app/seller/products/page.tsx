"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/lib/types"

export default function SellerProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm])

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

    await fetchProducts(token)
  }

  const fetchProducts = async (token: string) => {
    try {
      const response = await fetch("/api/seller/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        console.error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProducts(filtered)
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        await fetchProducts(token)
      } else {
        alert("Erreur lors de la mise à jour du statut")
      }
    } catch (error) {
      console.error("Error updating product status:", error)
      alert("Erreur de connexion")
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return

    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchProducts(token)
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Erreur de connexion")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Chargement des produits...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/seller">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Mes Produits</h1>
          </div>

          <Link href="/seller/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau produit
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                {products.length === 0 ? "Aucun produit créé" : "Aucun produit trouvé"}
              </p>
              {products.length === 0 && (
                <Link href="/seller/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer votre premier produit
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product._id} className={`${!product.isActive ? "opacity-60" : ""}`}>
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                    <Image
                      src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className="bg-primary">{product.category}</Badge>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">À partir de</p>
                      <p className="text-lg font-bold text-primary">
                        {Math.min(...product.priceTiers.map((t) => t.price)).toLocaleString()} $
                      </p>
                    </div>
                    <Badge variant="outline">{product.stock} en stock</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProductStatus(product._id, product.isActive)}
                      className="flex-1"
                    >
                      {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>

                    <Link href={`/seller/products/${product._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
