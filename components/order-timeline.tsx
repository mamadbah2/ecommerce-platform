import { CheckCircle, Clock, Package, Truck, MapPin, XCircle } from "lucide-react"
import type { OrderStatus } from "@/lib/types"

interface OrderTimelineProps {
  currentStatus: OrderStatus
  createdAt: Date
  deliveredAt?: Date
}

export function OrderTimeline({ currentStatus, createdAt, deliveredAt }: OrderTimelineProps) {
  const steps = [
    { key: "pending", label: "Commande reçue", icon: Clock },
    { key: "confirmed", label: "Confirmée", icon: CheckCircle },
    { key: "preparing", label: "En préparation", icon: Package },
    { key: "shipped", label: "Expédiée", icon: Truck },
    { key: "delivered", label: "Livrée", icon: MapPin },
  ]

  const getStepStatus = (stepKey: string) => {
    const statusOrder = ["pending", "confirmed", "preparing", "shipped", "delivered"]
    const currentIndex = statusOrder.indexOf(currentStatus)
    const stepIndex = statusOrder.indexOf(stepKey)

    if (currentStatus === "cancelled") {
      return stepIndex === 0 ? "completed" : "cancelled"
    }

    if (stepIndex <= currentIndex) {
      return "completed"
    } else {
      return "pending"
    }
  }

  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="h-6 w-6 text-red-500" />
        <div>
          <p className="font-semibold text-red-700">Commande annulée</p>
          <p className="text-sm text-red-600">Cette commande a été annulée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const status = getStepStatus(step.key)
        const Icon = step.icon
        const isLast = index === steps.length - 1

        return (
          <div key={step.key} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status === "completed"
                    ? "bg-primary text-primary-foreground"
                    : status === "cancelled"
                      ? "bg-red-100 text-red-500"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {!isLast && <div className={`w-0.5 h-8 mt-2 ${status === "completed" ? "bg-primary" : "bg-muted"}`} />}
            </div>

            <div className="flex-1 pb-8">
              <p
                className={`font-medium ${
                  status === "completed"
                    ? "text-primary"
                    : status === "cancelled"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
              {step.key === "pending" && (
                <p className="text-sm text-muted-foreground">
                  {createdAt.toLocaleDateString("fr-FR")} à {createdAt.toLocaleTimeString("fr-FR")}
                </p>
              )}
              {step.key === "delivered" && deliveredAt && status === "completed" && (
                <p className="text-sm text-muted-foreground">
                  {deliveredAt.toLocaleDateString("fr-FR")} à {deliveredAt.toLocaleTimeString("fr-FR")}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
