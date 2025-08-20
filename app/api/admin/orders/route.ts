import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { mockOrders, getProductById, getUserById } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    requireRole(token, ["admin"])

    // Get all orders with details
    const ordersWithDetails = mockOrders.map((order) => ({
      ...order,
      user: getUserById(order.userId),
      items: order.items.map((item) => ({
        ...item,
        product: getProductById(item.productId),
      })),
    }))

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
