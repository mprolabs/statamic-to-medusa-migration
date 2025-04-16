'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext } from 'react';

// Language dictionary types
export type Dictionary = {
  common: {
    shop: string;
    products: string;
    categories: string;
    cart: string;
    addToCart: string;
    viewCart: string;
    checkout: string;
    search: string;
    login: string;
    register: string;
    account: string;
    logout: string;
    welcome: string;
    featured: string;
    shopNow: string;
    viewAll: string;
    loadMore: string;
    price: string;
  };
  product: {
    outOfStock: string;
    inStock: string;
    quantity: string;
    addedToCart: string;
    relatedProducts: string;
    description: string;
    specifications: string;
    reviews: string;
  };
  cart: {
    empty: string;
    startShopping: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    remove: string;
    update: string;
    proceedToCheckout: string;
  };
};

// Supported languages
export type Locale = 'en' | 'nl' | 'de';
export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'nl', 'de'];

// Context for translation
export const DictionaryContext = createContext<Dictionary | null>(null);

// Hook to get dictionary from context
export function useDictionary() {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return dictionary;
}

// Utility function to get locale from params or default
export function getLocale(params?: { locale?: string }): Locale {
  const locale = params?.locale as Locale | undefined;
  if (locale && locales.includes(locale)) {
    return locale;
  }
  return defaultLocale;
}

// Hook to get current locale from URL
export function useLocale(): Locale {
  const pathname = usePathname();
  // Extract locale from pathname (e.g., /en/products, /nl/cart, etc.)
  const localeFromPath = pathname?.split('/')[1];
  return getLocale({ locale: localeFromPath });
}

// Function to get dictionary for server components
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    return (await import(`./dictionaries/${locale}.json`)).default as Dictionary;
  } catch (error) {
    console.error(`Error loading dictionary for locale ${locale}:`, error);
    return (await import(`./dictionaries/${defaultLocale}.json`)).default as Dictionary;
  }
}
