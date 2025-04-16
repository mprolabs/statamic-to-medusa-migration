import React from 'react'
import Link from 'next/link'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

interface Product {
  id: string
  name: string
  price: number
  currency: string
  image: string
  slug: string
  category: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency,
    }).format(price)
  }

  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-90 transition-opacity">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          className="h-64 w-full object-cover object-center"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            <Link href={`/products/${product.slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">{formatPrice(product.price, product.currency)}</p>
      </div>
      <button 
        className="absolute bottom-0 right-0 mb-4 mr-4 p-2 rounded-full bg-primary-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Add to cart"
      >
        <ShoppingBagIcon className="h-5 w-5" />
      </button>
    </div>
  )
} 