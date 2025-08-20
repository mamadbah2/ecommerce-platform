"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { CartItem, Product } from "./types"

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number; selectedPrice: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number; selectedPrice: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addToCart: (product: Product, quantity: number, selectedPrice: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number, selectedPrice: number) => void
  clearCart: () => void
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity, selectedPrice } = action.payload
      const existingItemIndex = state.items.findIndex((item) => item.productId === product._id)

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
                selectedPrice,
              }
            : item,
        )
      } else {
        // Add new item
        newItems = [
          ...state.items,
          {
            productId: product._id,
            product,
            quantity,
            selectedPrice,
          },
        ]
      }

      const total = newItems.reduce((sum, item) => sum + item.quantity * item.selectedPrice, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.productId !== action.payload.productId)
      const total = newItems.reduce((sum, item) => sum + item.quantity * item.selectedPrice, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity, selectedPrice } = action.payload
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: { productId } })
      }

      const newItems = state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              selectedPrice,
            }
          : item,
      )

      const total = newItems.reduce((sum, item) => sum + item.quantity * item.selectedPrice, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "LOAD_CART": {
      const items = action.payload
      const total = items.reduce((sum, item) => sum + item.quantity * item.selectedPrice, 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

      return { items, total, itemCount }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items))
  }, [state.items])

  const addToCart = (product: Product, quantity: number, selectedPrice: number) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity, selectedPrice } })
  }

  const removeFromCart = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } })
  }

  const updateQuantity = (productId: string, quantity: number, selectedPrice: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity, selectedPrice } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
