import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const minPrice = Math.min(...product.priceTiers.map((tier) => tier.price))
  const maxPrice = Math.max(...product.priceTiers.map((tier) => tier.price))

  return (
    <Link href={`/products/${product._id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-200 border-border/50 hover:border-primary/20">
        <CardContent className="p-0">
          <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
            <Image
              src={product.images[0] || "/placeholder.svg?height=300&width=300"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">{product.category}</Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4">
          <div className="w-full">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-right">
                {minPrice === maxPrice ? (
                  <p className="text-xl font-bold text-primary">{minPrice.toLocaleString()} GNF</p>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">À partir de</p>
                    <p className="text-xl font-bold text-primary">{minPrice.toLocaleString()} GNF</p>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="ml-2">
                {product.stock} en stock
              </Badge>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
