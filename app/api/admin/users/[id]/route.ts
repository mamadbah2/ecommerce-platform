import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { User } from "@/lib/models"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    await requireRole(token, ["admin"])
    await connectDB()

    const { id } = await params
    const user = await User.findById(id).lean() as any

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const { firstName, lastName, email, role, phone, address, isActive } = await request.json()

    // Prepare update data
    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (isActive !== undefined) updateData.isActive = isActive
    updateData.updatedAt = new Date()

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean() as any

    if (!updatedUser) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
    }

    // Format response (exclude password)
    const userResponse = {
      id: updatedUser._id.toString(),
      _id: updatedUser._id.toString(),
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      phone: updatedUser.phone || "",
      address: updatedUser.address || "",
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    }

    return NextResponse.json({
      message: "Utilisateur mis à jour avec succès",
      user: userResponse,
    })
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

    await requireRole(token, ["admin"])
    await connectDB()

    const { id } = await params
    const user = await User.findById(id).lean() as any

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Soft delete - just deactivate the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        isActive: false, 
        updatedAt: new Date() 
      },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: "Erreur lors de la désactivation" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Utilisateur désactivé avec succès",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
