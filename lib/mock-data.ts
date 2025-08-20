import type { User, Product, Order, PriceTier } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@ecommerce.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "System",
    role: "admin",
    phone: "+224 123 456 789",
    address: "Conakry, Guinea",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isActive: true,
  },
  {
    id: "2",
    email: "seller1@ecommerce.com",
    password: "seller123",
    firstName: "Mamadou",
    lastName: "Diallo",
    role: "seller",
    phone: "+224 987 654 321",
    address: "Kaloum, Conakry",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    isActive: true,
  },
  {
    id: "3",
    email: "seller2@ecommerce.com",
    password: "seller123",
    firstName: "Fatoumata",
    lastName: "Camara",
    role: "seller",
    phone: "+224 555 123 456",
    address: "Matam, Conakry",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    isActive: true,
  },
  {
    id: "4",
    email: "client@example.com",
    password: "client123",
    firstName: "Ibrahima",
    lastName: "Bah",
    role: "client",
    phone: "+224 777 888 999",
    address: "Dixinn, Conakry",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    isActive: true,
  },
]

const shoePriceTiers: PriceTier[] = [
  { minQuantity: 1, maxQuantity: 9, price: 80000 },
  { minQuantity: 10, maxQuantity: 49, price: 70000 },
  { minQuantity: 50, maxQuantity: 299, price: 60000 },
  { minQuantity: 300, price: 50000 },
]

const bagPriceTiers: PriceTier[] = [
  { minQuantity: 1, maxQuantity: 4, price: 120000 },
  { minQuantity: 5, maxQuantity: 19, price: 100000 },
  { minQuantity: 20, maxQuantity: 99, price: 85000 },
  { minQuantity: 100, price: 75000 },
]

const watchPriceTiers: PriceTier[] = [
  { minQuantity: 1, maxQuantity: 2, price: 250000 },
  { minQuantity: 3, maxQuantity: 9, price: 220000 },
  { minQuantity: 10, maxQuantity: 49, price: 200000 },
  { minQuantity: 50, price: 180000 },
]

export const mockProducts: Product[] = [
  {
    _id: "1",
    name: "Chaussures de Sport Nike",
    description: "Chaussures de sport confortables et durables, parfaites pour le running et les activités sportives.",
    images: ["/athletic-shoes.png"],
    category: "Chaussures",
    sellerId: "2",
    priceTiers: shoePriceTiers,
    stock: 500,
    isActive: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    _id: "2",
    name: "Sac à Main Élégant",
    description: "Sac à main en cuir véritable, design moderne et élégant pour toutes occasions.",
    images: ["/elegant-leather-handbag.png"],
    category: "Accessoires",
    sellerId: "2",
    priceTiers: bagPriceTiers,
    stock: 200,
    isActive: true,
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05"),
  },
  {
    _id: "3",
    name: "Montre Classique",
    description: "Montre classique avec bracelet en acier inoxydable, résistante à l'eau.",
    images: ["/placeholder-lxrb7.png"],
    category: "Montres",
    sellerId: "3",
    priceTiers: watchPriceTiers,
    stock: 150,
    isActive: true,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
  {
    _id: "4",
    name: "Chaussures Formelles",
    description: "Chaussures formelles en cuir pour occasions spéciales et bureau.",
    images: ["/formal-leather-shoes.png"],
    category: "Chaussures",
    sellerId: "3",
    priceTiers: [
      { minQuantity: 1, maxQuantity: 4, price: 150000 },
      { minQuantity: 5, maxQuantity: 19, price: 130000 },
      { minQuantity: 20, maxQuantity: 99, price: 110000 },
      { minQuantity: 100, price: 95000 },
    ],
    stock: 300,
    isActive: true,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    _id: "5",
    name: "Sac à Dos Moderne",
    description: "Sac à dos spacieux et moderne, idéal pour le travail et les voyages.",
    images: ["/modern-backpack.png"],
    category: "Accessoires",
    sellerId: "2",
    priceTiers: [
      { minQuantity: 1, maxQuantity: 9, price: 95000 },
      { minQuantity: 10, maxQuantity: 29, price: 85000 },
      { minQuantity: 30, maxQuantity: 99, price: 75000 },
      { minQuantity: 100, price: 65000 },
    ],
    stock: 250,
    isActive: true,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
]

export const mockOrders: Order[] = [
  {
    id: "1",
    userId: "4",
    items: [
      {
        id: "1",
        productId: "1",
        quantity: 2,
        unitPrice: 80000,
        totalPrice: 160000,
      },
    ],
    totalAmount: 160000,
    status: "pending",
    shippingAddress: "Dixinn, Conakry, Guinea",
    phone: "+224 777 888 999",
    notes: "Livraison le matin de préférence",
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-02-25"),
  },
]

// Helper functions
export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email)
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product._id === id)
}

export function getProductsBySeller(sellerId: string): Product[] {
  return mockProducts.filter((product) => product.sellerId === sellerId)
}

export function getOrdersByUser(userId: string): Order[] {
  return mockOrders.filter((order) => order.userId === userId)
}

export function getOrdersBySeller(sellerId: string): Order[] {
  return mockOrders.filter((order) =>
    order.items.some((item) => {
      const product = getProductById(item.productId)
      return product?.sellerId === sellerId
    }),
  )
}

export function calculateProductPrice(product: Product, quantity: number): number {
  const tier = product.priceTiers.find(
    (tier) => quantity >= tier.minQuantity && (tier.maxQuantity === undefined || quantity <= tier.maxQuantity),
  )
  return tier?.price || product.priceTiers[0].price
}
