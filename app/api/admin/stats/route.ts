import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { User, Product, Order } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    await requireRole(token, ["admin"])
    await connectDB()

    // Calculate platform statistics from database
    const users = await User.find({}).lean()
    const totalUsers = users.length
    const activeUsers = users.filter((u: any) => u.isActive).length
    const totalSellers = users.filter((u: any) => u.role === "seller").length
    const totalClients = users.filter((u: any) => u.role === "client").length

    const products = await Product.find({}).lean()
    const totalProducts = products.length
    const activeProducts = products.filter((p: any) => p.isActive).length

    const orders = await Order.find({}).lean()
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)

    // Orders by status
    const ordersByStatus = orders.reduce(
      (acc: Record<string, number>, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Users by role
    const usersByRole = users.reduce(
      (acc: Record<string, number>, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = users.filter((u: any) => new Date(u.createdAt) >= sevenDaysAgo).length
    const recentProducts = products.filter((p: any) => new Date(p.createdAt) >= sevenDaysAgo).length
    const recentOrders = orders.filter((o: any) => new Date(o.createdAt) >= sevenDaysAgo).length

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
