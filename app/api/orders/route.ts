import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Order, Product } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireAuth(token)
    const { items, shippingAddress, phone, notes } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Aucun article dans la commande" }, { status: 400 })
    }

    if (!shippingAddress || !phone) {
      return NextResponse.json({ error: "Adresse de livraison et téléphone requis" }, { status: 400 })
    }

    await connectDB()

    // Valider et récupérer les informations des produits
    const orderItems = []
    let totalAmount = 0

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || !product.isActive) {
        return NextResponse.json({ 
          error: `Produit non trouvé ou indisponible: ${item.productId}` 
        }, { status: 400 })
      }

      // Vérifier le stock
      console.log("Checking stock for product:", product.name, "Requested quantity:", item.quantity, "Available stock:", product.stock)
      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour le produit ${product.name}` 
        }, { status: 400 })
      }

      // Calculer le prix basé sur la quantité et les tiers de prix
      let unitPrice = product.priceTiers[0]?.price || 0
      for (const tier of product.priceTiers) {
        if (item.quantity >= tier.minQuantity && 
            (!tier.maxQuantity || item.quantity <= tier.maxQuantity)) {
          unitPrice = tier.price
        }
      }

      const itemTotal = item.quantity * unitPrice
      totalAmount += itemTotal

      orderItems.push({
        productId: product._id.toString(),
        productName: product.name,
        quantity: item.quantity,
        price: unitPrice
      })

      // Mettre à jour le stock du produit
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      )
    }

    console.log("Shipping Address:", shippingAddress)

    // Créer la commande en base
    const newOrder = new Order({
      userId: session.user.id,
      items: orderItems,
      totalAmount,
      status: "pending",
      shippingAddress,
      phone,
      notes: notes || ""
    })
    console.log("___New Order:", newOrder)
    const savedOrder = await newOrder.save()

    // Convertir en format attendu par le frontend
    const orderResponse = {
      id: savedOrder._id.toString(),
      userId: savedOrder.userId,
      items: savedOrder.items.map((item: any) => ({
        id: `${savedOrder._id}_${item.productId}`,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.quantity * item.price,
      })),
      totalAmount: savedOrder.totalAmount,
      status: savedOrder.status,
      shippingAddress: shippingAddress ,
      phone,
      notes,
      createdAt: savedOrder.createdAt,
      updatedAt: savedOrder.updatedAt,
    }

    return NextResponse.json({
      message: "Commande créée avec succès",
      order: orderResponse,
    })
  } catch (error) {
    console.error("Create order error:", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token d'authentification requis" }, { status: 401 })
    }

    const session = await requireAuth(token)
    
    await connectDB()
    
    // Récupérer les commandes de l'utilisateur depuis la base de données
    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 }) // Trier par date de création décroissante
      .lean() // Optimisation pour récupérer des objets JS purs

    // Convertir les commandes au format attendu par le frontend
    const formattedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      userId: order.userId,
      items: order.items.map((item: any, index: number) => ({
        id: `${order._id}_${index}`,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.quantity * item.price,
        product: {
          name: item.productName
        }
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      phone: order.phone || "",
      notes: order.notes || "",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))

    return NextResponse.json({
      orders: formattedOrders,
    })
  } catch (error) {
    console.error("Get orders error:", error)
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
