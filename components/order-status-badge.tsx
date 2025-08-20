import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return { label: "En attente", className: "bg-yellow-500" }
      case "confirmed":
        return { label: "Confirmée", className: "bg-blue-500" }
      case "preparing":
        return { label: "En préparation", className: "bg-orange-500" }
      case "shipped":
        return { label: "Expédiée", className: "bg-purple-500" }
      case "delivered":
        return { label: "Livrée", className: "bg-green-500" }
      case "cancelled":
        return { label: "Annulée", className: "bg-red-500" }
      default:
        return { label: status, className: "bg-gray-500" }
    }
  }

  const config = getStatusConfig(status)

  return <Badge className={config.className}>{config.label}</Badge>
}
