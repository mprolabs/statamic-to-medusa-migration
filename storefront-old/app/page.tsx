import React from 'react';
import Link from 'next/link';
import { client } from '../lib/graphql/client';
import { getCurrentLocale } from '../lib/graphql/client';
import { GET_FEATURED_PRODUCTS, GET_CATEGORIES } from '../lib/graphql/queries';
import { ProductsResponse, CategoriesResponse, LanguageCodeEnum } from '../lib/graphql/types';
import Image from 'next/image';

export default async function HomePage() {
  // Get current region and language
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as LanguageCodeEnum;
  
  // Fetch featured products
  const { data: featuredData } = await client.query<ProductsResponse>({
    query: GET_FEATURED_PRODUCTS,
    variables: {
      channel,
      languageCode,
    },
  });
  
  // Fetch categories for display in hero section
  const { data: categoriesData } = await client.query<CategoriesResponse>({
    query: GET_CATEGORIES,
    variables: {
      first: 5,
      channel,
      languageCode,
    },
  });
  
  const featuredProducts = featuredData?.products?.edges?.map(edge => edge.node) || [];
  const categories = categoriesData?.categories?.edges?.map(edge => edge.node) || [];
  
  return (
    <div>
      {/* Hero section */}
      <div className="relative bg-gray-900">
        <div className="relative h-80 sm:h-96 md:h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900/40" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Welcome to Saleor Store
            </h1>
            <p className="mt-6 text-xl text-white max-w-3xl">
              Discover our latest products with multi-region and multi-language support.
              Currently showing content for: <span className="font-semibold">{region}/{language}</span>
            </p>
            <div className="mt-8 flex">
              <Link
                href="/products"
                className="inline-block bg-indigo-600 border border-transparent rounded-md py-3 px-8 text-base font-medium text-white hover:bg-indigo-700"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category navigation */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map(category => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="group relative bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition"
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                  {category.backgroundImage ? (
                    <Image 
                      src={category.backgroundImage.url}
                      alt={category.backgroundImage.alt || category.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-center object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-3xl">📦</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3 className="text-lg font-medium text-white text-center px-2">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Featured products */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {featuredProducts.map(product => (
              <Link href={`/products/${product.slug}`} key={product.id} className="group">
                <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                  {product.thumbnail && (
                    <Image
                      src={product.thumbnail.url}
                      alt={product.thumbnail.alt || product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-center object-cover group-hover:opacity-75"
                    />
                  )}
                </div>
                <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {product.pricing?.priceRange?.start?.gross.amount} {product.pricing?.priceRange?.start?.gross.currency}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-block bg-white border border-gray-300 rounded-md py-2 px-8 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 