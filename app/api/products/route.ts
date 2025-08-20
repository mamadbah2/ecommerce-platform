import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { Product } from "@/lib/models"

export async function GET() {
  try {
    // Return active products with seller information
    /* const products = mockProducts
      .filter((product) => product.isActive)
      .map((product) => ({
        ...product,
        seller: undefined, // Don't include full seller info in list view
      })) */

    await connectDB()
    const products = await Product.find({ isActive: true })

    return NextResponse.json({
      products,
      total: products.length,
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
