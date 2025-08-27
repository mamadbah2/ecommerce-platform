export type UserRole = "customer" | "seller" | "admin"

export interface User {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  address?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface PriceTier {
  minQuantity: number
  maxQuantity?: number
  price: number
}

export interface Product {
  _id: string
  name: string
  description: string
  images: string[]
  category: string
  sellerId: string
  seller?: {
    id:string,
    firstName:string,
    lastName:string
  }
  priceTiers: PriceTier[]
  stock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  productId: string
  product?: Product
  quantity: number
  selectedPrice: number
}

export interface Cart {
  id: string
  userId?: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled"

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  userId: string
  user?: User
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingAddress: string
  phone: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  deliveredAt?: Date
}

export interface AuthSession {
  user: User
  token: string
}
