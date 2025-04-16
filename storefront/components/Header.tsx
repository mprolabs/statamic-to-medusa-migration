'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../packages/ui/src/components/navigation-menu';
import { Button } from '../packages/ui/src/components/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '../packages/ui/src/components/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../packages/ui/src/components/dropdown-menu';
import { useCartStore } from '../store/cart';
import CartDrawer from './CartDrawer';
import LanguageSelector from './LanguageSelector';
import RegionSelector from './RegionSelector';
import { getCurrentLocale } from '../lib/graphql/client';
import { cn } from '../lib/utils';

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
  { name: 'Language Demo', href: '/language-demo', current: false },
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

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  Bolen Store
                </Link>
              </div>

              <div className="hidden sm:ml-6 sm:flex">
                <NavigationMenuList>
                  {navigation.map((item) => (
                    <NavigationMenuItem key={item.name}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors",
                            pathname === item.href || pathname?.startsWith(item.href + '/')
                              ? "text-indigo-600"
                              : "text-gray-700 hover:text-indigo-500"
                          )}
                        >
                          {item.name}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </div>
            </div>

            <div className="flex items-center">
              {/* Language and Region Selectors */}
              <div className="flex space-x-2">
                <LanguageSelector />
                <RegionSelector />
              </div>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative ml-4"
                aria-label="Open cart"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-3"
                    aria-label="User menu"
                  >
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Your Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Your Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <div className="ml-4 flex items-center sm:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Menu">
                      <Bars3Icon className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="space-y-4 py-6">
                      {navigation.map((item) => (
                        <SheetClose asChild key={item.name}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block px-3 py-2 text-base font-medium",
                              pathname === item.href || pathname?.startsWith(item.href + '/')
                                ? "text-indigo-600"
                                : "text-gray-700 hover:text-indigo-500"
                            )}
                            aria-current={item.current ? 'page' : undefined}
                          >
                            {item.name}
                          </Link>
                        </SheetClose>
                      ))}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex flex-col space-y-4">
                          <Link href="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-500">
                            Your Profile
                          </Link>
                          <Link href="/orders" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-500">
                            Your Orders
                          </Link>
                          <button className="text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-500">
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
};

export default Header;
