'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import Image from 'next/image';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Plus, Minus } from 'lucide-react';
import { GET_PRODUCT_DETAILS } from '../lib/graphql/queries';
import { Product } from '../lib/graphql/types';
import { useCartStore } from '../store/cart';
import { getCurrentLocale } from '../lib/graphql/client';
import { cn } from '../lib/utils';
import {
  Card,
  CardContent,
} from '../packages/ui/src/components/card';
import { Button } from '../packages/ui/src/components/button';
import {
  RadioGroup,
  RadioGroupItem,
} from '../packages/ui/src/components/radio-group';
import { Label } from '../packages/ui/src/components/label';
import { Skeleton } from '../packages/ui/src/components/skeleton';
import { Input } from '../packages/ui/src/components/input';
import ProductCard from './ProductCard';

interface ProductDetailProps {
  slug: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ slug }) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCartStore();

  // Get current locale for language and region
  const { region, language } = getCurrentLocale();

  // Get the product details using GraphQL
  const { loading, error, data } = useQuery(GET_PRODUCT_DETAILS, {
    variables: {
      slug,
      channel: region,
      languageCode: language,
    },
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start mt-12 mb-16">
          <div className="aspect-square">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Product</h2>
          <p className="text-gray-500 mb-6">{error.message}</p>
          <Button variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The requested product could not be found.</p>
          <Button variant="outline">Browse Products</Button>
        </div>
      </div>
    );
  }

  const product = data.product;
  const variants = product.variants || [];

  // Select first variant by default if none selected
  if (variants.length > 0 && !selectedVariantId) {
    setSelectedVariantId(variants[0].id);
  }

  const currentVariant = selectedVariantId
    ? variants.find((v: any) => v.id === selectedVariantId)
    : variants.length > 0
      ? variants[0]
      : null;

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      variantId: currentVariant?.id,
      name: product.name,
      variantName: currentVariant?.name || '',
      price: product.pricing?.priceRange?.start?.gross.amount || 0,
      currency: product.pricing?.priceRange?.start?.gross.currency || 'USD',
      imageSrc: product.thumbnail?.url || '/placeholder-product.jpg',
      quantity,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Render variants with RadioGroup
  const renderVariants = () => {
    if (!variants || variants.length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Variants</h3>
        <RadioGroup
          value={selectedVariantId || ''}
          onValueChange={handleVariantSelect}
          className="grid grid-cols-3 gap-3 sm:grid-cols-4"
        >
          {variants.map((variant: any) => (
            <div key={variant.id} className="flex items-center space-x-2">
              <RadioGroupItem
                value={variant.id}
                id={variant.id}
                className="sr-only"
              />
              <Label
                htmlFor={variant.id}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-center rounded-md border py-2 px-3 text-sm font-medium",
                  selectedVariantId === variant.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                )}
              >
                {variant.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  // Related products are from the same category
  const relatedProducts = product.category?.products?.edges?.map((edge: { node: Product }) => edge.node).slice(0, 4) || [];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start mt-12 mb-16">
          {/* Image gallery */}
          <div className="flex flex-col">
            <div className="overflow-hidden rounded-lg aspect-square">
              <Image
                src={product.thumbnail?.url || '/placeholder-product.jpg'}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-center object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.media?.slice(0, 4).map((media: any) => (
                <div key={media.url} className="overflow-hidden rounded-lg aspect-square cursor-pointer">
                  <Image
                    src={media.url}
                    alt={media.alt || product.name}
                    width={150}
                    height={150}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
            <div className="mt-3">
              <p className="text-2xl text-gray-900">
                {product.pricing?.priceRange?.start?.gross.amount} {product.pricing?.priceRange?.start?.gross.currency}
              </p>
            </div>

            <div className="mt-6">
              <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>

            {renderVariants()}

            <div className="mt-8">
              <div className="flex items-center">
                <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mr-4">
                  Quantity
                </Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-l-md"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="text"
                    id="quantity"
                    name="quantity"
                    className="h-9 w-16 rounded-none border-x-0 text-center"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value) || 1)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-r-md"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                className="w-full"
                size="lg"
                variant={addedToCart ? "secondary" : "default"}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Added to cart!
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                    Add to cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct: Product) => {
                const productProps = {
                  id: relatedProduct.id,
                  name: relatedProduct.name,
                  slug: relatedProduct.slug,
                  thumbnail: relatedProduct.thumbnail?.url || undefined,
                  price: {
                    amount: relatedProduct.pricing?.priceRange?.start?.gross.amount || 0,
                    currency: relatedProduct.pricing?.priceRange?.start?.gross.currency || 'USD',
                  },
                  category: relatedProduct.category?.name,
                };
                return <ProductCard key={relatedProduct.id} {...productProps} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
