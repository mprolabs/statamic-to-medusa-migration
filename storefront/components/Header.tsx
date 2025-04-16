'use client';

import React, { useState, Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '../lib/stores/cartStore';
import CartDrawer from './CartDrawer';
import { getCurrentLocale, setLocale } from '../lib/graphql/client';

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/', current: true },
  { name: 'Products', href: '/products', current: false },
  { name: 'Categories', href: '/categories', current: false },
  { name: 'About', href: '/about', current: false },
];

const Header: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCartStore();
  const { region, language } = getCurrentLocale();

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  // Language and region options
  const regions = ['US', 'EU', 'DE', 'PL'];
  const languages = ['en', 'de', 'pl'];

  const handleLocaleChange = (newRegion: string, newLanguage: string) => {
    setLocale(newRegion, newLanguage);
  };

  return (
    <>
      <Disclosure as="nav" className="bg-white shadow">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link href="/" className="text-xl font-bold text-indigo-600">
                      Bolen Store
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          pathname === item.href || pathname?.startsWith(item.href + '/')
                            ? 'border-indigo-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  {/* Region/Language Selector */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <span className="sr-only">Open locale menu</span>
                        <span className="px-2 py-1 text-sm text-gray-700 hover:text-gray-900">
                          {region}/{language}
                        </span>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {regions.map(reg => (
                          <div key={reg}>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500">{reg}</div>
                            {languages.map(lang => (
                              <Menu.Item key={`${reg}-${lang}`}>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleLocaleChange(reg, lang)}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } ${
                                      region === reg && language === lang ? 'bg-indigo-50 text-indigo-500' : ''
                                    } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                                  >
                                    {lang.toUpperCase()}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* Cart Button */}
                  <button
                    type="button"
                    className="relative ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={openCart}
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open cart</span>
                    <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/orders"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Your Orders
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* Mobile menu button */}
                  <div className="ml-4 flex items-center sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={`${
                      pathname === item.href || pathname?.startsWith(item.href + '/')
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    } block border-l-4 py-2 pl-3 pr-4 text-base font-medium`}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">Guest User</div>
                    <div className="text-sm font-medium text-gray-500">guest@example.com</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as="a"
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Your Profile
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="/orders"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Your Orders
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="#"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
};

export default Header;
