"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import type { Product, PriceTier } from "@/lib/types"

interface ProductFormProps {
  product?: Product
  onSubmit: (productData: any) => void
  onCancel: () => void
  loading?: boolean
}

export function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "",
    stock: product?.stock || 0,
    images: product?.images || [],
  })

  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(
    product?.priceTiers || [{ minQuantity: 1, maxQuantity: 9, price: 0 }],
  )

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addPriceTier = () => {
    const lastTier = priceTiers[priceTiers.length - 1]
    const newMinQuantity = lastTier.maxQuantity ? lastTier.maxQuantity + 1 : lastTier.minQuantity + 10

    setPriceTiers((prev) => [
      ...prev,
      {
        minQuantity: newMinQuantity,
        maxQuantity: newMinQuantity + 9,
        price: 0,
      },
    ])
  }

  const removePriceTier = (index: number) => {
    if (priceTiers.length > 1) {
      setPriceTiers((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const updatePriceTier = (index: number, field: keyof PriceTier, value: any) => {
    setPriceTiers((prev) =>
      prev.map((tier, i) =>
        i === index
          ? {
              ...tier,
              [field]: field === "price" || field === "minQuantity" || field === "maxQuantity" ? Number(value) : value,
            }
          : tier,
      ),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.description || !formData.category || !formData.stock) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (priceTiers.some((tier) => tier.price <= 0)) {
      alert("Tous les prix doivent être supérieurs à 0")
      return
    }

    onSubmit({
      ...formData,
      priceTiers,
      stock: Number(formData.stock),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Chaussures de sport Nike"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Décrivez votre produit en détail..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="Ex: Chaussures, Accessoires"
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock disponible *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", Number(e.target.value))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prix par quantité</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPriceTier}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un niveau
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {priceTiers.map((tier, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <Label>Quantité min</Label>
                  <Input
                    type="number"
                    min="1"
                    value={tier.minQuantity}
                    onChange={(e) => updatePriceTier(index, "minQuantity", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Quantité max</Label>
                  <Input
                    type="number"
                    min={tier.minQuantity}
                    value={tier.maxQuantity || ""}
                    onChange={(e) =>
                      updatePriceTier(index, "maxQuantity", e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Illimité"
                  />
                </div>

                <div>
                  <Label>Prix (GNF)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={tier.price}
                    onChange={(e) => updatePriceTier(index, "price", e.target.value)}
                  />
                </div>
              </div>

              {priceTiers.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removePriceTier(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-semibold mb-1">Conseil:</p>
            <p>
              Définissez des prix dégressifs pour encourager les achats en gros. Plus la quantité est importante, plus
              le prix unitaire devrait être bas.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Enregistrement..." : product ? "Mettre à jour" : "Créer le produit"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
