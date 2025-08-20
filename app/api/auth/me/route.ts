import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await getSession(token)

    if (!session) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 })
    }

    return NextResponse.json({
      user: session.user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
