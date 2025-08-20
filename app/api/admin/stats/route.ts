import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { mockUsers, mockProducts, mockOrders } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    requireRole(token, ["admin"])

    // Calculate platform statistics
    const totalUsers = mockUsers.length
    const activeUsers = mockUsers.filter((u) => u.isActive).length
    const totalSellers = mockUsers.filter((u) => u.role === "seller").length
    const totalClients = mockUsers.filter((u) => u.role === "client").length

    const totalProducts = mockProducts.length
    const activeProducts = mockProducts.filter((p) => p.isActive).length

    const totalOrders = mockOrders.length
    const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Orders by status
    const ordersByStatus = mockOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Users by role
    const usersByRole = mockUsers.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = mockUsers.filter((u) => u.createdAt >= sevenDaysAgo).length
    const recentProducts = mockProducts.filter((p) => p.createdAt >= sevenDaysAgo).length
    const recentOrders = mockOrders.filter((o) => o.createdAt >= sevenDaysAgo).length

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          sellers: totalSellers,
          clients: totalClients,
          recent: recentUsers,
          byRole: usersByRole,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          recent: recentProducts,
        },
        orders: {
          total: totalOrders,
          recent: recentOrders,
          byStatus: ordersByStatus,
        },
        revenue: {
          total: totalRevenue,
        },
      },
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
