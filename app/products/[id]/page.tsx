"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PriceCalculator } from "@/components/price-calculator"
import { ArrowLeft, ShoppingCart, User } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/types"


export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedPrice, setSelectedPrice] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        let productWithSeller:Product = {
          ...data.product._doc,
          seller: {
            id: data.product.seller._id,
            firstName: data.product.seller.firstName,
            lastName: data.product.seller.lastName
          }
        }
        setProduct(productWithSeller)
        setSelectedPrice(data.product._doc.priceTiers[0].price)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (quantity: number, price: number) => {
    setSelectedQuantity(quantity)
    setSelectedPrice(price)
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedQuantity, selectedPrice)
      router.push("/cart")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Chargement du produit...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Produit non trouvé</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.images[0] || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary">{product.category}</Badge>
                <Badge variant="outline">{product.stock} en stock</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
            </div>

            {product.seller && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Vendu par</p>
                      <p className="text-muted-foreground">
                        {product.seller.firstName} {product.seller.lastName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* <PriceCalculator product={product} onQuantityChange={handleQuantityChange} /> */}

            {/* <Button size="lg" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ajouter au panier - {(selectedPrice * selectedQuantity).toLocaleString()} $
            </Button> */}

            <Card className="border-muted">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Informations</h3>
                <p className="text-sm text-muted-foreground">
                  Ce site est de type vitrine. Aucun paiement en ligne requis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
