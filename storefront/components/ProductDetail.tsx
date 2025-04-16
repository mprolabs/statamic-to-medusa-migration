'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_DETAILS } from '../lib/graphql/queries';
import { Product, ProductResponse } from '../lib/graphql/types';
import { useCartStore } from '../lib/stores/cartStore';
import Image from 'next/image';
import Link from 'next/link';

interface ProductDetailProps {
  slug: string;
  channel?: string;
  languageCode?: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  slug,
  channel,
  languageCode
}) => {
  const { loading, error, data } = useQuery<ProductResponse>(
    GET_PRODUCT_DETAILS,
    { 
      variables: {
        slug,
        channel,
        languageCode
      }
    }
  );
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCartStore();

  if (loading) return <div className="my-8 text-center">Loading product details...</div>;
  if (error) return <div className="my-8 text-center text-red-500">Error loading product: {error.message}</div>;
  if (!data || !data.product) return <div className="my-8 text-center">Product not found.</div>;

  const product = data.product;
  
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    // Add to cart with the selected variant if any
    addItem(product, quantity, selectedVariantId || undefined);
    
    // Show success message
    setAddedToCart(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsAddingToCart(false);
      setAddedToCart(false);
    }, 3000);
  };
  
  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId === selectedVariantId ? null : variantId);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col">
            {product.thumbnail && (
              <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={product.thumbnail.url}
                  alt={product.thumbnail.alt || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-center object-cover"
                />
              </div>
            )}
            
            {/* Additional product images */}
            {product.media && product.media.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.media.map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} - image ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            {/* Category */}
            {product.category && (
              <Link 
                href={`/categories/${product.category.slug}`}
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                {product.category.name}
              </Link>
            )}
            
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
            
            {/* Price */}
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900">
                {product.pricing?.priceRange?.start?.gross.amount} {product.pricing?.priceRange?.start?.gross.currency}
              </p>
              
              {product.pricing?.onSale && (
                <p className="text-sm text-red-500 mt-1">On Sale</p>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div 
                className="text-base text-gray-700 space-y-6"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
              />
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">Variants</h3>
                <div className="mt-2">
                  <div className="flex items-center space-x-3">
                    {product.variants.map(variant => (
                      <div 
                        key={variant.id}
                        className={`relative p-2 rounded-md border cursor-pointer ${
                          selectedVariantId === variant.id 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleVariantSelect(variant.id)}
                      >
                        <span className="text-sm">{variant.name}</span>
                        {variant.pricing?.price && (
                          <p className="mt-1 text-xs text-gray-500">
                            {variant.pricing.price.gross.amount} {variant.pricing.price.gross.currency}
                          </p>
                        )}
                        
                        {selectedVariantId === variant.id && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Quantity */}
            <div className="mt-8">
              <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <select
                id="quantity"
                name="quantity"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={quantity}
                onChange={handleQuantityChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Add to cart button */}
            <div className="mt-8">
              <button
                type="button"
                className={`w-full border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white ${
                  isAddingToCart || addedToCart
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? 'Adding...' : addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 