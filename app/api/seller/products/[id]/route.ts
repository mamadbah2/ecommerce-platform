import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { mockProducts, getProductById } from "@/lib/mock-data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = requireRole(token, ["seller", "admin"])
    const product = getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }

    // Check if seller owns this product (unless admin)
    if (session.user.role !== "admin" && product.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { name, description, images, category, priceTiers, stock, isActive } = await request.json()

    // Update product
    const productIndex = mockProducts.findIndex((p) => p.id === params.id)
    if (productIndex >= 0) {
      mockProducts[productIndex] = {
        ...mockProducts[productIndex],
        name: name || product.name,
        description: description || product.description,
        images: images || product.images,
        category: category || product.category,
        priceTiers: priceTiers || product.priceTiers,
        stock: stock !== undefined ? Number(stock) : product.stock,
        isActive: isActive !== undefined ? isActive : product.isActive,
        updatedAt: new Date(),
      }

      return NextResponse.json({
        message: "Produit mis à jour avec succès",
        product: mockProducts[productIndex],
      })
    }

    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  } catch (error) {
    console.error("Update product error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = requireRole(token, ["seller", "admin"])
    const product = getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }

    // Check if seller owns this product (unless admin)
    if (session.user.role !== "admin" && product.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Soft delete - just mark as inactive
    const productIndex = mockProducts.findIndex((p) => p.id === params.id)
    if (productIndex >= 0) {
      mockProducts[productIndex].isActive = false
      mockProducts[productIndex].updatedAt = new Date()

      return NextResponse.json({
        message: "Produit supprimé avec succès",
      })
    }

    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  } catch (error) {
    console.error("Delete product error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
