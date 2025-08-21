"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingBag, User, MapPin } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  // Auth form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsAuthenticated(true)
    } else {
      setShowAuthForm(true)
    }
  }, [])

  useEffect(() => {
    if (state.items.length === 0) {
      router.push("/cart")
    }
  }, [state.items, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register"
      const body =
        authMode === "login" ? { email, password } : { email, password, firstName, lastName, phone: phone || undefined }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setIsAuthenticated(true)
        setShowAuthForm(false)
      } else {
        alert(data.error || "Erreur d'authentification")
      }
    } catch (error) {
      console.error("Auth error:", error)
      alert("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: state.items,
          shippingAddress,
          phone,
          notes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        clearCart()
        router.push(`/order-confirmation/${data.order.id}`)
      } else {
        alert(data.error || "Erreur lors de la création de la commande")
        if (data.error === "Authentification requise") {
          setShowAuthForm(true)
        }
      }
    } catch (error) {
      console.error("Order error:", error)
      alert("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/cart">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au panier
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Finaliser la commande</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Authentication Form */}
              {showAuthForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {authMode === "login" ? "Connexion" : "Créer un compte"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                      {authMode === "register" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Nom</Label>
                            <Input
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Chargement..." : authMode === "login" ? "Se connecter" : "Créer le compte"}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                          className="text-primary hover:underline"
                        >
                          {authMode === "login" ? "Créer un compte" : "Déjà un compte ? Se connecter"}
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Shipping Form */}
              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Informations de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      <div>
                        <Label htmlFor="shippingAddress">Adresse de livraison</Label>
                        <Textarea
                          id="shippingAddress"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Votre adresse complète de livraison"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+224 XXX XXX XXX"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes (optionnel)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Instructions spéciales pour la livraison"
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={loading}>
                        {loading ? "Traitement..." : "Confirmer la commande"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {item.selectedPrice.toLocaleString()} GNF
                          </p>
                        </div>
                        <p className="font-semibold">{(item.quantity * item.selectedPrice).toLocaleString()} GNF</p>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{state.total.toLocaleString()} GNF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span className="text-primary">Gratuite</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{state.total.toLocaleString()} GNF</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">Paiement à la livraison</p>
                    <p>Vous paierez {state.total.toLocaleString()} GNF lors de la réception de votre commande.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
