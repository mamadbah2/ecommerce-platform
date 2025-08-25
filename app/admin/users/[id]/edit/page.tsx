"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, User as UserIcon } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/types"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string>("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "client" as "client" | "seller" | "admin",
    phone: "",
    address: "",
    isActive: true,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

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

  const fetchUser = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await fetch(`/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const targetUser = data.users.find((u: any) => u.id === userId || u._id === userId)
        
        if (targetUser) {
          setUser(targetUser)
          setFormData({
            firstName: targetUser.firstName || "",
            lastName: targetUser.lastName || "",
            email: targetUser.email || "",
            role: targetUser.role || "client",
            phone: targetUser.phone || "",
            address: targetUser.address || "",
            isActive: targetUser.isActive ?? true,
          })
        } else {
          setError("Utilisateur non trouvé")
        }
      } else if (response.status === 404) {
        setError("Utilisateur non trouvé")
      } else if (response.status === 403) {
        setError("Vous n'avez pas l'autorisation de modifier cet utilisateur")
      } else {
        setError("Erreur lors du chargement de l'utilisateur")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setError("Erreur de connexion")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      alert("Veuillez remplir tous les champs obligatoires")
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert("Veuillez saisir une adresse email valide")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/users")
      } else {
        const data = await response.json()
        alert(data.error || "Erreur lors de la mise à jour de l'utilisateur")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/users")
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg">Chargement de l'utilisateur...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link href="/admin/users">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux utilisateurs
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Erreur</h1>
            </div>

            {/* Error Message */}
            <div className="text-center py-12">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-destructive font-medium">{error}</p>
                <div className="mt-4">
                  <Link href="/admin/users">
                    <Button variant="outline">
                      Retour à la liste des utilisateurs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
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
                Retour aux utilisateurs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Modifier l'utilisateur</h1>
              <p className="text-muted-foreground">
                {user.firstName} {user.lastName} ({user.email})
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Rôle *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="seller">Vendeur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+224 XXX XXX XXX"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Adresse complète"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive" className="text-base">
                      Compte actif
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Détermine si l'utilisateur peut se connecter et utiliser la plateforme
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                Annuler
              </Button>
            </div>
          </form>

          {/* User Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID utilisateur :</span>
                <span className="font-mono">{user.id || (user as any)._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date de création :</span>
                <span>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dernière modification :</span>
                <span>{new Date(user.updatedAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
