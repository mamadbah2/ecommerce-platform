"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ProductForm } from "@/components/seller/product-form"
import Link from "next/link"
import type { Product } from "@/lib/types"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [sellerId, setSellerId] = useState<string>("")
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (sellerId && productId) {
      fetchProduct()
    }
  }, [sellerId, productId])

  const checkAuth = () => {
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

    setSellerId(user.id || user._id || "")
  }

  const fetchProduct = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      } else if (response.status === 404) {
        setError("Produit non trouvé")
      } else if (response.status === 403) {
        setError("Vous n'avez pas l'autorisation de modifier ce produit")
      } else {
        setError("Erreur lors du chargement du produit")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Erreur de connexion")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (productData: any) => {
    setLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        router.push("/seller/products")
      } else {
        const data = await response.json()
        alert(data.error || "Erreur lors de la mise à jour du produit")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/seller/products")
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg">Chargement du produit...</p>
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link href="/seller/products">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Mes produits
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Erreur</h1>
            </div>

            {/* Error Message */}
            <div className="text-center py-12">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-destructive font-medium">{error}</p>
                <div className="mt-4">
                  <Link href="/seller/products">
                    <Button variant="outline">
                      Retour à mes produits
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

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/seller/products">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Mes produits
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Modifier le produit</h1>
              <p className="text-muted-foreground">{product.name}</p>
            </div>
          </div>

          {/* Form */}
          <ProductForm 
            product={product}
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
            loading={loading}
            sellerId={sellerId}
          />
        </div>
      </div>
    </div>
  )
}
