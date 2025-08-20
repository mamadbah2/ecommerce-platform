import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { getProductsBySeller, getOrdersBySeller } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = requireRole(token, ["seller", "admin"])
    const sellerProducts = getProductsBySeller(session.user.id)
    const sellerOrders = getOrdersBySeller(session.user.id)

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
        order.items.forEach((item) => {
          if (sellerProducts.some((p) => p.id === item.productId)) {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity
          }
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const product = sellerProducts.find((p) => p.id === productId)
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
