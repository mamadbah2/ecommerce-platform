import { type NextRequest, NextResponse } from "next/server"
import { getProductById, getUserById } from "@/lib/mock-data"
import connectDB from "@/lib/mongodb"
import { Product, User } from "@/lib/models"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // const product = getProductById(params.id)
    await connectDB()
    const { id } = await params
    const product = await Product.findOne({ _id: id })

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }
    console.log("Product found:", product)
    // Include seller information
    // const seller = getUserById(product.sellerId)
    const seller = await User.findById(product.sellerId).select("firstName lastName")
    const productWithSeller = {
      ...product,
      seller: seller ? { id: seller.id, firstName: seller.firstName, lastName: seller.lastName } : null,
    }

    return NextResponse.json({ product: productWithSeller })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
