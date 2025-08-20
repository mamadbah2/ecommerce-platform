import mongoose, { Schema, Document } from 'mongoose'

// Interface pour l'utilisateur
export interface IUser extends Document {
  _id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'customer' | 'seller' | 'admin'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Interface pour le produit
export interface IProduct extends Document {
  _id: string
  name: string
  description: string
  category: string
  stock: number
  priceTiers: Array<{
    minQuantity: number
    maxQuantity: number
    price: number
  }>
  images: string[]
  sellerId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Interface pour la commande
export interface IOrder extends Document {
  _id: string
  userId: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    variant?: {
      size?: string
      color?: string
    }
  }>
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
}

// Schéma utilisateur
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Schéma produit
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  priceTiers: [{
    minQuantity: {
      type: Number,
      required: true
    },
    maxQuantity: {
      type: Number,
      required: false
    },
    price: {
      type: Number,
      required: true
    }
  }],
  stock: {
    type: Number,
    required: true,
    default: 1
  },
  images: [String],
  sellerId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Schéma commande
const OrderSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    variant: {
      size: String,
      color: String
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
})

// Créer les modèles avec vérification
export const User = (mongoose.models && mongoose.models.User) || mongoose.model<IUser>('User', UserSchema)
export const Product = (mongoose.models && mongoose.models.Product) || mongoose.model<IProduct>('Product', ProductSchema)
export const Order = (mongoose.models && mongoose.models.Order) || mongoose.model<IOrder>('Order', OrderSchema)
