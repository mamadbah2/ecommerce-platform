import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Product } from "@/lib/models"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireRole(token, ["seller", "admin"])
    const { id } = await params
    
    await connectDB()
    
    const product = await Product.findById(id) as any

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }

    // Check if seller owns this product (unless admin)
    if (session.user.role !== "admin" && product.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { name, description, images, category, priceTiers, stock, isActive } = await request.json()

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (images !== undefined) updateData.images = images
    if (category !== undefined) updateData.category = category
    if (priceTiers !== undefined) updateData.priceTiers = priceTiers
    if (stock !== undefined) updateData.stock = Number(stock)
    if (isActive !== undefined) updateData.isActive = isActive
    updateData.updatedAt = new Date()

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean() as any

    if (!updatedProduct) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
    }

    // Format response
    const productResponse = {
      _id: updatedProduct._id.toString(),
      id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      images: updatedProduct.images,
      category: updatedProduct.category,
      sellerId: updatedProduct.sellerId,
      priceTiers: updatedProduct.priceTiers,
      stock: updatedProduct.stock,
      isActive: updatedProduct.isActive,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    }

    return NextResponse.json({
      message: "Produit mis à jour avec succès",
      product: productResponse,
    })
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

    const session = await requireRole(token, ["seller", "admin"])
    const { id } = await params
    
    await connectDB()
    
    const product = await Product.findById(id) as any

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }

    // Check if seller owns this product (unless admin)
    if (session.user.role !== "admin" && product.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Soft delete - just mark as inactive
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        isActive: false, 
        updatedAt: new Date() 
      },
      { new: true }
    )

    if (!updatedProduct) {
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Produit supprimé avec succès",
    })
  } catch (error) {
    console.error("Delete product error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
