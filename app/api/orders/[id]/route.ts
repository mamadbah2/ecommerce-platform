import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Order, Product, User } from "@/lib/models"
import type { OrderStatus } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireAuth(token)
    const { id } = await params
    
    await connectDB()
    
    const order = await Order.findById(id).lean() as any

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Check if user can access this order  
    let canAccess = session.user.role === "admin" || session.user.id === order.userId

    if (!canAccess && session.user.role === "seller") {
      // Check if seller owns any products in this order
      for (const item of order.items) {
        const product = await Product.findById(item.productId)
        if (product?.sellerId === session.user.id) {
          canAccess = true
          break
        }
      }
    }

    if (!canAccess) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Get user and product details
    const user = await User.findById(order.userId).lean() as any
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item: any) => {
        const product = await Product.findById(item.productId).lean() as any
        return {
          id: `${order._id}_${item.productId}`,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.quantity * item.price,
          product: {
            name: product?.name || item.productName,
            description: product?.description || '',
            images: product?.images || [],
            category: product?.category || ''
          }
        }
      })
    )

    // Format order response
    const orderWithDetails = {
      id: order._id.toString(),
      userId: order.userId,
      items: itemsWithDetails,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      phone: order.phone,
      notes: order.notes || "",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: user ? {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      } : null
    }

    return NextResponse.json({ order: orderWithDetails })
  } catch (error) {
    console.error("Get order error:", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireAuth(token)
    const { id } = await params
    
    await connectDB()
    
    const order = await Order.findById(id) as any

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Check permissions
    let canUpdate = session.user.role === "admin"

    if (!canUpdate && session.user.role === "seller") {
      // Check if seller owns any products in this order
      for (const item of order.items) {
        const product = await Product.findById(item.productId)
        if (product?.sellerId === session.user.id) {
          canUpdate = true
          break
        }
      }
    }

    if (!canUpdate) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { status, deliveredAt } = await request.json()

    if (status && !["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    // Update order
    const updateData: any = {}
    if (status) updateData.status = status
    if (deliveredAt) updateData.deliveredAt = new Date(deliveredAt)
    updateData.updatedAt = new Date()

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean() as any

    if (!updatedOrder) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
    }

    // Format response
    const orderResponse = {
      id: updatedOrder._id.toString(),
      userId: updatedOrder.userId,
      items: updatedOrder.items.map((item: any, index: number) => ({
        id: `${updatedOrder._id}_${index}`,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.quantity * item.price,
        product: {
          name: item.productName
        }
      })),
      totalAmount: updatedOrder.totalAmount,
      status: updatedOrder.status,
      shippingAddress: updatedOrder.shippingAddress,
      phone: updatedOrder.phone || "",
      notes: updatedOrder.notes || "",
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
    }

    return NextResponse.json({
      message: "Commande mise à jour avec succès",
      order: orderResponse,
    })
  } catch (error) {
    console.error("Update order error:", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
