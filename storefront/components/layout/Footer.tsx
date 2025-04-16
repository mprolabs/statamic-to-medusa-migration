import React from 'react'
import Link from 'next/link'

const footerNavigation = {
  shop: [
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'New Arrivals', href: '/products/new' },
    { name: 'Sale', href: '/products/sale' },
  ],
  account: [
    { name: 'My Account', href: '/account' },
    { name: 'Order History', href: '/account/orders' },
    { name: 'Wishlist', href: '/account/wishlist' },
    { name: 'Returns', href: '/account/returns' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Saleor Store</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your multi-region, multi-language e-commerce solution powered by Saleor.
            </p>
            <div className="space-x-4">
              {/* Social media links - simplified for now */}
              <a href="#" className="text-gray-400 hover:text-primary-600">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600">
                Instagram
              </a>
            </div>
          </div>

          {/* Navigation sections */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-3">
              {footerNavigation.shop.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-600 hover:text-primary-600 text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Account</h3>
            <ul className="space-y-3">
              {footerNavigation.account.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-600 hover:text-primary-600 text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-600 hover:text-primary-600 text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section with copyright */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Saleor Store. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-primary-600 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-600 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-600 text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
