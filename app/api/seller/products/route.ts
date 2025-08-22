import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Product } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireRole(token, ["seller", "admin"])
    
    await connectDB()
    
    // Récupérer les produits du vendeur depuis la base de données
    const sellerProducts = await Product.find({ sellerId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    // Convertir au format attendu par le frontend
    const formattedProducts = sellerProducts.map((product: any) => ({
      _id: product._id.toString(),
      id: product._id.toString(), // Compatibilité avec le frontend
      name: product.name,
      description: product.description,
      images: product.images || [],
      category: product.category,
      sellerId: product.sellerId,
      priceTiers: product.priceTiers,
      stock: product.stock,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length,
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

    const session = await requireRole(token, ["seller", "admin"])
    const { name, description, images, category, priceTiers, stock } = await request.json()

    if (!name || !description || !category || !priceTiers || stock === undefined) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    // Validate price tiers
    if (!Array.isArray(priceTiers) || priceTiers.length === 0) {
      return NextResponse.json({ error: "Au moins un niveau de prix est requis" }, { status: 400 })
    }

    await connectDB()

    // Créer le nouveau produit en base
    const newProduct = new Product({
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
    })

    const savedProduct = await newProduct.save()

    // Convertir au format attendu par le frontend
    const productResponse = {
      _id: savedProduct._id.toString(),
      id: savedProduct._id.toString(), // Compatibilité avec le frontend
      name: savedProduct.name,
      description: savedProduct.description,
      images: savedProduct.images,
      category: savedProduct.category,
      sellerId: savedProduct.sellerId,
      priceTiers: savedProduct.priceTiers,
      stock: savedProduct.stock,
      isActive: savedProduct.isActive,
      createdAt: savedProduct.createdAt,
      updatedAt: savedProduct.updatedAt,
    }

    return NextResponse.json({
      message: "Produit créé avec succès",
      product: productResponse,
    })
  } catch (error) {
    console.error("Create product error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
