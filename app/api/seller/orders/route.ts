import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { getOrdersBySeller } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = requireRole(token, ["seller", "admin"])
    const sellerOrders = getOrdersBySeller(session.user.id)

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
