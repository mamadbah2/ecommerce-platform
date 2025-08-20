"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { UserForm } from "@/components/admin/user-form"
import Link from "next/link"

export default function NewUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== "admin") {
      router.push("/")
      return
    }
  }

  const handleSubmit = async (userData: any) => {
    setLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        router.push("/admin/users")
      } else {
        const data = await response.json()
        alert(data.error || "Erreur lors de la création de l'utilisateur")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/users")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/users">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Utilisateurs
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Nouvel Utilisateur</h1>
          </div>

          {/* Form */}
          <UserForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
        </div>
      </div>
    </div>
  )
}
