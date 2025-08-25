import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { User } from "@/lib/models"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    await requireRole(token, ["admin"])
    await connectDB()

    // Get all users from database, excluding passwords
    const users = await User.find({}, { password: 0 }).lean() as any[]

    // Format users for response
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length,
    })
  } catch (error) {
    console.error("Get users error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    await requireRole(token, ["admin"])
    await connectDB()

    const { email, password, firstName, lastName, role, phone, address } = await request.json()

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    if (!["client", "seller", "admin"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean()
    if (existingUser) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      phone: phone || "",
      address: address || "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedUser = await newUser.save()

    // Format response (exclude password)
    const userResponse = {
      id: savedUser._id.toString(),
      _id: savedUser._id.toString(),
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      phone: savedUser.phone,
      address: savedUser.address,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    }

    return NextResponse.json({
      message: "Utilisateur créé avec succès",
      user: userResponse,
    })
  } catch (error) {
    console.error("Create user error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
