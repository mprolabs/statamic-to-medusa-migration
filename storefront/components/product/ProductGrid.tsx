import React from 'react'
import Link from 'next/link'
import ProductCard from './ProductCard'

// Sample products - in real app, these would come from API
const products = [
  {
    id: 'prod1',
    name: 'Cotton T-Shirt',
    price: 29.99,
    currency: 'EUR',
    image: '/product1.jpg',
    slug: 'cotton-t-shirt',
    category: 'clothing',
  },
  {
    id: 'prod2',
    name: 'Denim Jeans',
    price: 89.99,
    currency: 'EUR',
    image: '/product2.jpg',
    slug: 'denim-jeans',
    category: 'clothing',
  },
  {
    id: 'prod3',
    name: 'Leather Wallet',
    price: 49.99,
    currency: 'EUR',
    image: '/product3.jpg',
    slug: 'leather-wallet',
    category: 'accessories',
  },
  {
    id: 'prod4',
    name: 'Sunglasses',
    price: 59.99,
    currency: 'EUR',
    image: '/product4.jpg',
    slug: 'sunglasses',
    category: 'accessories',
  },
  {
    id: 'prod5',
    name: 'Running Shoes',
    price: 129.99,
    currency: 'EUR',
    image: '/product5.jpg',
    slug: 'running-shoes',
    category: 'footwear',
  },
  {
    id: 'prod6',
    name: 'Canvas Tote Bag',
    price: 39.99,
    currency: 'EUR',
    image: '/product6.jpg',
    slug: 'canvas-tote-bag',
    category: 'accessories',
  },
  {
    id: 'prod7',
    name: 'Wireless Headphones',
    price: 199.99,
    currency: 'EUR',
    image: '/product7.jpg',
    slug: 'wireless-headphones',
    category: 'electronics',
  },
  {
    id: 'prod8',
    name: 'Smart Watch',
    price: 249.99,
    currency: 'EUR',
    image: '/product8.jpg',
    slug: 'smart-watch',
    category: 'electronics',
  },
]

interface ProductGridProps {
  limit?: number
  category?: string
}

export default function ProductGrid({ limit, category }: ProductGridProps) {
  let filteredProducts = category 
    ? products.filter(product => product.category === category)
    : products

  if (limit && limit > 0) {
    filteredProducts = filteredProducts.slice(0, limit)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
} 