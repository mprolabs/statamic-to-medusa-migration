import React from 'react'
import Link from 'next/link'
import { ShoppingBagIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import RegionSelector from './RegionSelector'
import LanguageSelector from './LanguageSelector'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container">
        {/* Top bar with region/language selectors */}
        <div className="flex justify-end items-center py-2 space-x-4 text-sm border-b">
          <RegionSelector />
          <LanguageSelector />
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl text-primary-600">
            Saleor Store
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-primary-600" aria-label="Search">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <Link href="/account" className="p-2 text-gray-500 hover:text-primary-600" aria-label="Account">
              <UserIcon className="h-6 w-6" />
            </Link>
            <Link href="/cart" className="p-2 text-gray-500 hover:text-primary-600 relative" aria-label="Cart">
              <ShoppingBagIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
