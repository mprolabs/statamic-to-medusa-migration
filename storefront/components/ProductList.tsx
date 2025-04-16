"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../packages/ui/src/components/select";
import { Button } from "../packages/ui/src/components/button";
import { Skeleton } from "../packages/ui/src/components/skeleton";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { getCurrentLocale } from "../lib/graphql/client";
import { cn } from "../lib/utils";

interface ProductListProps {
  products: ProductCardProps[];
  categories?: { id: string; name: string }[];
  loading?: boolean;
  error?: Error | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories = [],
  loading = false,
  error = null,
  onLoadMore,
  hasMore = false,
}) => {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams?.get("category") || "all"
  );
  const [filteredProducts, setFilteredProducts] = useState<ProductCardProps[]>(products);
  const { region, language } = getCurrentLocale();

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) => product.category === selectedCategory)
      );
    }
  }, [selectedCategory, products]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500">Error loading products: {error.message}</p>
        <Button variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="mb-4 sm:mb-0 text-2xl font-bold tracking-tight">
          Products {region && `for ${region}`} {language && `in ${language}`}
        </h2>

        {categories.length > 0 && (
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filteredProducts.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}

            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="h-full">
                  <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm">
                    <Skeleton className="aspect-square w-full rounded-t-lg" />
                    <div className="p-4">
                      <Skeleton className="mb-2 h-4 w-1/3" />
                      <Skeleton className="mb-2 h-5 w-2/3" />
                      <Skeleton className="h-5 w-1/4" />
                    </div>
                    <div className="p-4 pt-0">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {(hasMore || loading) && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={onLoadMore}
                disabled={loading || !hasMore}
                className={cn("min-w-[200px]", {
                  "opacity-50 cursor-not-allowed": loading || !hasMore
                })}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;
