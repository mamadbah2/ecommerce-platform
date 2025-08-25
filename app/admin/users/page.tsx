"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Edit, Trash2, Search, Eye, EyeOff, Info } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/types"

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, selectedRole])

  const checkAuth = async () => {
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

    await fetchUsers(token)
  }

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole)
    }

    setFilteredUsers(filtered)
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        await fetchUsers(token)
      } else {
        alert("Erreur lors de la mise à jour du statut")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Erreur de connexion")
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver cet utilisateur ?")) return

    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchUsers(token)
      } else {
        alert("Erreur lors de la désactivation")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Erreur de connexion")
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "seller":
        return "bg-green-500"
      case "client":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          </div>

          <Link href="/admin/users/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedRole === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole(null)}
            >
              Tous les rôles
            </Button>
            <Button
              variant={selectedRole === "client" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole("client")}
            >
              Clients
            </Button>
            <Button
              variant={selectedRole === "seller" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole("seller")}
            >
              Vendeurs
            </Button>
            <Button
              variant={selectedRole === "admin" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole("admin")}
            >
              Administrateurs
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""} trouvé
            {filteredUsers.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">Aucun utilisateur trouvé</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className={`${!user.isActive ? "opacity-60" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-muted-foreground">{user.email}</p>
                        {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {/* Créé le {user.createdAt.toLocaleDateString("fr-FR")} */}
                          Créé le {user.createdAt.toString().split("T")[0]}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/admin/users/${user.id}/details`}>
                          <Button variant="outline" size="sm">
                            <Info className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user.id, user.isActive)}>
                          {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>

                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
