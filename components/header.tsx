"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, LogOut, Package } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { User as UserType } from "@/lib/types"
import { authFetch } from "@/lib/auth"

export function Header() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const { state } = useCart()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authFetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        console.log("User data:", userData)
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const cartItemCount = state.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <header className="bg-primary border-b border-yellow-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GuinéeShop</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-yellow-600 transition-colors">
              Produits
            </Link>
            {user && (
              <>
                <Link href="/orders" className="text-gray-700 hover:text-yellow-600 transition-colors">
                  Mes Commandes
                </Link>
                {user.role === "seller" && (
                  <Link href="/seller" className="text-gray-700 hover:text-yellow-600 transition-colors">
                    Dashboard Vendeur
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className="text-gray-700 hover:text-yellow-600 transition-colors">
                    Administration
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs">{cartItemCount}</Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Bonjour, {user.firstName}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
