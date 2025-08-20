"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ProductForm } from "@/components/seller/product-form"
import Link from "next/link"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

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
  }

  const handleSubmit = async (productData: any) => {
    setLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/seller/products", {
        method: "POST",
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
        alert(data.error || "Erreur lors de la création du produit")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/seller/products")
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
            <h1 className="text-3xl font-bold">Nouveau Produit</h1>
          </div>

          {/* Form */}
          <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
        </div>
      </div>
    </div>
  )
}
