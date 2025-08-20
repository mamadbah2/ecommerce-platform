import { type NextRequest, NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (token) {
      logout(token)
    }

    return NextResponse.json({
      message: "Déconnexion réussie",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
