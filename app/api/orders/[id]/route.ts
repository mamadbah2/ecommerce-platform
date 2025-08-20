import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { mockOrders, getProductById, getUserById } from "@/lib/mock-data"
import type { OrderStatus } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = requireAuth(token)
    const order = mockOrders.find((o) => o.id === params.id)

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Check if user can access this order
    const canAccess =
      session.user.role === "admin" ||
      session.user.id === order.userId ||
      (session.user.role === "seller" &&
        order.items.some((item) => {
          const product = getProductById(item.productId)
          return product?.sellerId === session.user.id
        }))

    if (!canAccess) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Include product and user details
    const orderWithDetails = {
      ...order,
      user: getUserById(order.userId),
      items: order.items.map((item) => ({
        ...item,
        product: getProductById(item.productId),
      })),
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

    const session = requireAuth(token)
    const order = mockOrders.find((o) => o.id === params.id)

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // Check permissions
    const canUpdate =
      session.user.role === "admin" ||
      (session.user.role === "seller" &&
        order.items.some((item) => {
          const product = getProductById(item.productId)
          return product?.sellerId === session.user.id
        }))

    if (!canUpdate) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { status, deliveredAt } = await request.json()

    if (status && !["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    // Update order
    const orderIndex = mockOrders.findIndex((o) => o.id === params.id)
    if (orderIndex >= 0) {
      mockOrders[orderIndex] = {
        ...mockOrders[orderIndex],
        status: (status as OrderStatus) || order.status,
        deliveredAt: deliveredAt ? new Date(deliveredAt) : order.deliveredAt,
        updatedAt: new Date(),
      }

      return NextResponse.json({
        message: "Commande mise à jour avec succès",
        order: mockOrders[orderIndex],
      })
    }

    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  } catch (error) {
    console.error("Update order error:", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
