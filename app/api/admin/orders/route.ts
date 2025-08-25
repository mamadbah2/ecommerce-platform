import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Order, User, Product } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    await requireRole(token, ["admin"])
    await connectDB()

    // Get all orders with populated details
    const orders = await Order.find({}).lean() as any[]
    
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Get user details
        const user = await User.findById(order.userId).lean() as any
        
        // Get product details for each item
        const itemsWithProducts = await Promise.all(
          order.items.map(async (item: any) => {
            const product = await Product.findById(item.productId).lean() as any
            return {
              id: item.id || `${order._id}_${item.productId}`,
              productId: item.productId,
              productName: item.productName || product?.name || "Produit supprimé",
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.quantity * item.price,
              product: product ? {
                _id: product._id,
                name: product.name,
                images: product.images,
                category: product.category,
                sellerId: product.sellerId
              } : null
            }
          })
        )

        return {
          id: order._id.toString(),
          _id: order._id.toString(),
          userId: order.userId,
          items: itemsWithProducts,
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress,
          phone: order.phone || "",
          notes: order.notes || "",
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          user: user ? {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          } : null
        }
      })
    )

    // Sort by creation date (most recent first)
    ordersWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      orders: ordersWithDetails,
      total: ordersWithDetails.length,
    })
  } catch (error) {
    console.error("Get admin orders error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
