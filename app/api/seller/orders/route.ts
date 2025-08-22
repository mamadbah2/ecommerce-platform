import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Order, Product } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireRole(token, ["seller", "admin"])
    
    await connectDB()
    
    // Get all orders that contain products from this seller
    const allOrders = await Order.find({}).lean() as any[]
    const sellerOrders = []

    for (const order of allOrders) {
      let hasSellerProduct = false
      const enrichedItems = []

      for (const item of order.items) {
        const product = await Product.findById(item.productId)
        if (product && product.sellerId === session.user.id) {
          hasSellerProduct = true
        }
        enrichedItems.push({
          id: `${order._id}_${item.productId}`,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.quantity * item.price,
          product: {
            name: item.productName,
            sellerId: product?.sellerId
          }
        })
      }

      if (hasSellerProduct) {
        sellerOrders.push({
          id: order._id.toString(),
          userId: order.userId,
          items: enrichedItems,
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress,
          phone: order.phone || "",
          notes: order.notes || "",
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })
      }
    }

    // Sort by creation date (most recent first)
    sellerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      orders: sellerOrders,
      total: sellerOrders.length,
    })
  } catch (error) {
    console.error("Get seller orders error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
