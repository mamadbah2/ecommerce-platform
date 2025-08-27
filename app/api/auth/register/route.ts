import { type NextRequest, NextResponse } from "next/server"
import { User } from "@/lib/models"
import connectDB from "@/lib/mongodb"
import bcrypt from 'bcryptjs'
import { login } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, address } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user (default role is customer)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: "customer",
      phone,
      address,
      isActive: true,
    })

    // Auto-login after registration using the login function
    const session = await login(email, password)
    
    if (!session) {
      return NextResponse.json({ error: "Erreur lors de la connexion automatique" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Compte créé avec succès",
      user: session.user,
      token: session.token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
