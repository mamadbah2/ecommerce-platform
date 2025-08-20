import { type NextRequest, NextResponse } from "next/server"
import { requireRole, createUser } from "@/lib/auth"
import { mockUsers } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    requireRole(token, ["admin"])

    // Return all users without passwords
    const users = mockUsers.map((user) => ({
      ...user,
      password: undefined,
    }))

    return NextResponse.json({
      users,
      total: users.length,
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

    requireRole(token, ["admin"])

    const { email, password, firstName, lastName, role, phone, address } = await request.json()

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    if (!["client", "seller", "admin"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = mockUsers.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 })
    }

    // Create new user
    const newUser = createUser({
      email,
      password,
      firstName,
      lastName,
      role: role as "client" | "seller" | "admin",
      phone,
      address,
      isActive: true,
    })

    return NextResponse.json({
      message: "Utilisateur créé avec succès",
      user: { ...newUser, password: undefined },
    })
  } catch (error) {
    console.error("Create user error:", error)
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
