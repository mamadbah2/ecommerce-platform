import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Product, User } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    await requireRole(token, ["admin"])
    await connectDB()

    // Get all products from all sellers
    const products = await Product.find({}).lean() as any[]
    
    // Enrich with seller information
    const productsWithSellers = await Promise.all(
      products.map(async (product) => {
        const seller = await User.findById(product.sellerId).lean() as any
        
        return {
          _id: product._id.toString(),
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          images: product.images,
          category: product.category,
          sellerId: product.sellerId,
          seller: seller ? {
            id: seller._id.toString(),
            firstName: seller.firstName,
            lastName: seller.lastName,
            email: seller.email
          } : null,
          priceTiers: product.priceTiers,
          stock: product.stock,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }
      })
    )

    // Sort by creation date (most recent first)
    productsWithSellers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      products: productsWithSellers,
      total: productsWithSellers.length,
    })
  } catch (error) {
    console.error("Get admin products error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
