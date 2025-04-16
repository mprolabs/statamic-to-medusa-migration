import React from 'react'
import Link from 'next/link'

const categories = [
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Find trendy and comfortable clothing for all seasons.',
    image: '/category-clothing.jpg',
    href: '/categories/clothing',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Complete your look with our stylish accessories.',
    image: '/category-accessories.jpg',
    href: '/categories/accessories',
  },
  {
    id: 'footwear',
    name: 'Footwear',
    description: 'Step out in style with our comfortable footwear collection.',
    image: '/category-footwear.jpg',
    href: '/categories/footwear',
  },
  {
    id: 'home',
    name: 'Home',
    description: 'Transform your space with our home decor collection.',
    image: '/category-home.jpg',
    href: '/categories/home',
  },
]

export default function FeaturedCategories() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={category.href}>
          <div className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            {/* Using regular img for simplicity */}
            <div className="aspect-w-3 aspect-h-2 bg-gray-200">
              <img
                src={category.image || '/placeholder-category.jpg'}
                alt={category.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-white/80 line-clamp-2">{category.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
