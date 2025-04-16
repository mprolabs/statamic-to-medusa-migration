"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardContent,
  CardFooter
} from "../packages/ui/src/components/card";
import { Button } from "../packages/ui/src/components/button";
import { useCartStore } from "../store/cart";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  price: {
    amount: number;
    currency: string;
  };
  category?: string;
  onAddToCart?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  slug,
  thumbnail,
  price,
  category,
  onAddToCart,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to cart
    addItem({
      id,
      name,
      price: price.amount,
      currency: price.currency,
      imageSrc: thumbnail || undefined,
      quantity: 1,
    });

    // Show feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);

    // Call parent handler if provided
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  return (
    <Link href={`/product/${slug}`} className="block h-full">
      <Card className="h-full transition-all duration-200 hover:shadow-md">
        <div className="relative aspect-square overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <p className="text-sm text-gray-500">No image</p>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {category && (
            <p className="mb-1 text-xs font-medium text-gray-500">{category}</p>
          )}
          <h3 className="mb-2 text-sm font-medium text-gray-900">{name}</h3>
          <p className="text-base font-bold text-gray-900">
            {price.currency} {price.amount.toFixed(2)}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            className="w-full"
            variant={isAdded ? "secondary" : "default"}
          >
            {isAdded ? (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingBagIcon className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
