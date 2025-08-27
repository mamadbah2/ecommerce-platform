import Link from "next/link"
import { Package } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Mabex</span>
            </div>
            <p className="text-gray-600 mb-4">
              Votre plateforme e-commerce de confiance avec des prix dégressifs selon la quantité. Découvrez nos
              produits de qualité et profitez de nos offres avantageuses.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-yellow-600 transition-colors">
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-yellow-600 transition-colors">
                  Panier
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-yellow-600 transition-colors">
                  Mes Commandes
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600">Email: support@guineeshop.com</span>
              </li>
              <li>
                <span className="text-gray-600">Téléphone: +224 123 456 789</span>
              </li>
              <li>
                <span className="text-gray-600">Paiement à la livraison uniquement</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 mt-8">
          <p className="text-center text-gray-500 text-sm">© 2024 Mabex. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
