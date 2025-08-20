"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Phone, Calendar } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/lib/types"

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch order details from API
    // For now, we'll simulate it
    const timer = setTimeout(() => {
      setOrder({
        id: params.id as string,
        userId: "4",
        items: [],
        totalAmount: 0,
        status: "pending",
        shippingAddress: "Adresse de livraison",
        phone: "+224 XXX XXX XXX",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg">Chargement de votre commande...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
            <p className="text-muted-foreground">Votre commande #{params.id} a été enregistrée avec succès.</p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Détails de la commande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Numéro de commande:</span>
                <Badge variant="outline">#{params.id}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Statut:</span>
                <Badge className="bg-yellow-500">En attente</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Commandé le {new Date().toLocaleDateString("fr-FR")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Confirmation du vendeur</p>
                  <p className="text-sm text-muted-foreground">
                    Le vendeur va confirmer votre commande dans les prochaines heures.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Préparation</p>
                  <p className="text-sm text-muted-foreground">Votre commande sera préparée pour l'expédition.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Livraison</p>
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez votre commande et effectuerez le paiement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Besoin d'aide ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Contacter le support
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Suivre ma commande
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Continuer les achats
              </Button>
            </Link>
            <Link href="/orders" className="flex-1">
              <Button className="w-full">Voir mes commandes</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
