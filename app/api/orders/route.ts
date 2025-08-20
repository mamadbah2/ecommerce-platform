import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { mockOrders } from "@/lib/mock-data"
import type { Order, OrderItem } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireAuth(token)
    const { items, shippingAddress, phone, notes } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Aucun article dans la commande" }, { status: 400 })
    }

    if (!shippingAddress || !phone) {
      return NextResponse.json({ error: "Adresse de livraison et téléphone requis" }, { status: 400 })
    }

    // Create order items
    const orderItems: OrderItem[] = items.map((item: any, index: number) => ({
      id: (mockOrders.length * 10 + index + 1).toString(),
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.selectedPrice,
      totalPrice: item.quantity * item.selectedPrice,
    }))

    // Calculate total
    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)

    // Create new order
    const newOrder: Order = {
      id: (mockOrders.length + 1).toString(),
      userId: session.user.id,
      items: orderItems,
      totalAmount,
      status: "pending",
      shippingAddress,
      phone,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockOrders.push(newOrder)

    return NextResponse.json({
      message: "Commande créée avec succès",
      order: newOrder,
    })
  } catch (error) {
    console.error("Create order error:", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireAuth(token)
    const userOrders = mockOrders.filter((order) => order.userId === session.user.id)

    return NextResponse.json({
      orders: userOrders,
    })
  } catch (error) {
    console.error("Get orders error:", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
