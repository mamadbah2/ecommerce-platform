import { type NextRequest, NextResponse } from "next/server"
import { createUser, login } from "@/lib/auth"
import { getUserByEmail } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, address } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 })
    }

    // Create new user (default role is client)
    const newUser = createUser({
      email,
      password,
      firstName,
      lastName,
      role: "client",
      phone,
      address,
      isActive: true,
    })

    // Auto-login after registration
    const session = await login(email, password)

    return NextResponse.json({
      message: "Compte créé avec succès",
      user: session?.user,
      token: session?.token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
