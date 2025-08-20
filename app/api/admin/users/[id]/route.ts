import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { mockUsers, getUserById } from "@/lib/mock-data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    requireRole(token, ["admin"])

    const user = getUserById(params.id)
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const { firstName, lastName, email, role, phone, address, isActive } = await request.json()

    // Update user
    const userIndex = mockUsers.findIndex((u) => u.id === params.id)
    if (userIndex >= 0) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        role: role || user.role,
        phone: phone || user.phone,
        address: address || user.address,
        isActive: isActive !== undefined ? isActive : user.isActive,
        updatedAt: new Date(),
      }

      return NextResponse.json({
        message: "Utilisateur mis à jour avec succès",
        user: { ...mockUsers[userIndex], password: undefined },
      })
    }

    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  } catch (error) {
    console.error("Update user error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    requireRole(token, ["admin"])

    const user = getUserById(params.id)
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Soft delete - just deactivate
    const userIndex = mockUsers.findIndex((u) => u.id === params.id)
    if (userIndex >= 0) {
      mockUsers[userIndex].isActive = false
      mockUsers[userIndex].updatedAt = new Date()

      return NextResponse.json({
        message: "Utilisateur désactivé avec succès",
      })
    }

    return NextResponse.json({ error: "Erreur lors de la désactivation" }, { status: 500 })
  } catch (error) {
    console.error("Delete user error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
