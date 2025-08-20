import connectDB from '../lib/mongodb'
import { User, Product } from '../lib/models'
import { hashPassword } from '../lib/auth'

async function seedDatabase() {
  try {
    await connectDB()

    // Nettoyer la base
    await User.deleteMany({})
    await Product.deleteMany({})

    console.log('Base de données nettoyée')

    // Créer des utilisateurs
    const users = [
      {
        email: 'admin@guineeshop.com',
        password: await hashPassword('admin123'),
        firstName: 'Admin',
        lastName: 'GuinéeShop',
        role: 'admin'
      },
      {
        email: 'vendeur@guineeshop.com',
        password: await hashPassword('vendeur123'),
        firstName: 'Mamadou',
        lastName: 'Ba',
        role: 'seller'
      },
      {
        email: 'client@guineeshop.com',
        password: await hashPassword('client123'),
        firstName: 'Fatou',
        lastName: 'Diallo',
        role: 'customer'
      }
    ]

    const createdUsers = await User.insertMany(users)
    console.log(`${createdUsers.length} utilisateurs créés`)

    // Créer quelques produits
    const sellerId = createdUsers.find(u => u.role === 'seller')?._id.toString()

    if (sellerId) {
      const products = [
        {
          name: 'Chaussures élégantes en cuir',
          description: 'Chaussures en cuir véritable, parfaites pour les occasions formelles',
          category: 'Chaussures',
          stock: 500,
          priceTiers: [
            { minQuantity: 1, maxQuantity: 9, price: 80000 },
            { minQuantity: 10, maxQuantity: 49, price: 70000 },
            { minQuantity: 50, maxQuantity: 299, price: 60000 },
            { minQuantity: 300, price: 50000 },
          ],
          images: ['/formal-leather-shoes.png'],
          sellerId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Sac à main élégant',
          description: 'Sac à main en cuir de haute qualité pour femmes',
          category: 'Accessoires',
          stock: 200,
          priceTiers: [
            { minQuantity: 1, maxQuantity: 4, price: 120000 },
            { minQuantity: 5, maxQuantity: 19, price: 100000 },
            { minQuantity: 20, maxQuantity: 99, price: 85000 },
            { minQuantity: 100, price: 75000 },
          ],
          sellerId,
          images: ['/elegant-leather-handbag.png'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Montre Classique",
          description: "Montre classique avec bracelet en acier inoxydable, résistante à l'eau.",
          images: ["/placeholder-lxrb7.png"],
          category: "Montres",
          stock: 200,
          priceTiers: [
            { minQuantity: 1, maxQuantity: 4, price: 120000 },
            { minQuantity: 5, maxQuantity: 19, price: 100000 },
            { minQuantity: 20, maxQuantity: 99, price: 85000 },
            { minQuantity: 100, price: 75000 },
          ],
          sellerId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Chaussures Formelles",
          description: "Chaussures formelles en cuir pour occasions spéciales et bureau.",
          images: ["/formal-leather-shoes.png"],
          category: "Chaussures",
          sellerId,
          priceTiers: [
            { minQuantity: 1, maxQuantity: 4, price: 150000 },
            { minQuantity: 5, maxQuantity: 19, price: 130000 },
            { minQuantity: 20, maxQuantity: 99, price: 110000 },
            { minQuantity: 100, price: 95000 },
          ],
          stock: 300,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Sac à Dos Moderne",
          description: "Sac à dos spacieux et moderne, idéal pour le travail et les voyages.",
          images: ["/modern-backpack.png"],
          category: "Accessoires",
          sellerId,
          priceTiers: [
            { minQuantity: 1, maxQuantity: 9, price: 95000 },
            { minQuantity: 10, maxQuantity: 29, price: 85000 },
            { minQuantity: 30, maxQuantity: 99, price: 75000 },
            { minQuantity: 100, price: 65000 },
          ],
          stock: 250,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const createdProducts = await Product.insertMany(products)
      console.log(`${createdProducts.length} produits créés`)
    }

    console.log('Base de données initialisée avec succès!')

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
  } finally {
    process.exit()
  }
}

seedDatabase()
