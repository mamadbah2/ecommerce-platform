import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Product, Order } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireRole(token, ["seller", "admin"])
    
    await connectDB()
    
    // Get seller products
    const sellerProducts = await Product.find({ sellerId: session.user.id }).lean() as any[]
    
    // Get all orders and filter for seller products
    const allOrders = await Order.find({}).lean() as any[]
    const sellerOrders = []
    
    for (const order of allOrders) {
      let hasSellerProduct = false
      let sellerOrderTotal = 0
      const sellerItems = []

      for (const item of order.items) {
        const product = sellerProducts.find(p => p._id.toString() === item.productId)
        if (product) {
          hasSellerProduct = true
          sellerOrderTotal += item.quantity * item.price
          sellerItems.push(item)
        }
      }

      if (hasSellerProduct) {
        sellerOrders.push({
          ...order,
          items: sellerItems,
          totalAmount: sellerOrderTotal
        })
      }
    }

    // Calculate statistics
    const totalProducts = sellerProducts.length
    const activeProducts = sellerProducts.filter((p) => p.isActive).length
    const totalOrders = sellerOrders.length
    const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Orders by status
    const ordersByStatus = sellerOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Top selling products
    const productSales = sellerOrders.reduce(
      (acc, order) => {
        order.items.forEach((item: any) => {
          acc[item.productId] = (acc[item.productId] || 0) + item.quantity
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const product = sellerProducts.find((p) => p._id.toString() === productId)
        return {
          product: product?.name || "Produit inconnu",
          quantity,
        }
      })

    return NextResponse.json({
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        topProducts,
      },
    })
  } catch (error) {
    console.error("Get seller stats error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
