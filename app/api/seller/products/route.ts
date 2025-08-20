import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { mockProducts, getProductsBySeller } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = requireRole(token, ["seller", "admin"])
    const sellerProducts = getProductsBySeller(session.user.id)

    return NextResponse.json({
      products: sellerProducts,
      total: sellerProducts.length,
    })
  } catch (error) {
    console.error("Get seller products error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = requireRole(token, ["seller", "admin"])
    const { name, description, images, category, priceTiers, stock } = await request.json()

    if (!name || !description || !category || !priceTiers || !stock) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    // Validate price tiers
    if (!Array.isArray(priceTiers) || priceTiers.length === 0) {
      return NextResponse.json({ error: "Au moins un niveau de prix est requis" }, { status: 400 })
    }

    const newProduct: Product = {
      id: (mockProducts.length + 1).toString(),
      name,
      description,
      images: images || [],
      category,
      sellerId: session.user.id,
      priceTiers: priceTiers.map((tier: any) => ({
        minQuantity: Number(tier.minQuantity),
        maxQuantity: tier.maxQuantity ? Number(tier.maxQuantity) : undefined,
        price: Number(tier.price),
      })),
      stock: Number(stock),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockProducts.push(newProduct)

    return NextResponse.json({
      message: "Produit créé avec succès",
      product: newProduct,
    })
  } catch (error) {
    console.error("Create product error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
