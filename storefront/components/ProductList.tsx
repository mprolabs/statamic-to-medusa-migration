'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../lib/graphql/queries';
import type { Product, ProductsResponse, Connection, Edge } from '../lib/graphql/types';
import Image from 'next/image';
import Link from 'next/link';

interface ProductListProps {
  limit?: number;
  categorySlug?: string;
  showLoadMore?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  limit = 8,
  categorySlug,
  showLoadMore = false
}) => {
  const [displayLimit, setDisplayLimit] = useState<number>(limit);

  // Define variables for the query
  const variables: Record<string, any> = {
    first: displayLimit,
  };

  // Add category filter if categorySlug is provided
  if (categorySlug) {
    variables.filter = {
      categories: [categorySlug]
    };
  }

  const { loading, error, data, fetchMore } = useQuery<ProductsResponse>(
    GET_PRODUCTS,
    { variables }
  );

  if (loading) return <div className="my-8 text-center">Loading products...</div>;
  if (error) return <div className="my-8 text-center text-red-500">Error loading products: {error.message}</div>;
  if (!data || !data.products || !data.products.edges || data.products.edges.length === 0) {
    return <div className="my-8 text-center">No products found.</div>;
  }

  const products = data.products.edges.map((edge: Edge<Product>) => edge.node);
  const hasNextPage = data.products.pageInfo.hasNextPage;

  const loadMoreProducts = () => {
    if (hasNextPage) {
      fetchMore({
        variables: {
          first: displayLimit,
          after: data.products.pageInfo.endCursor,
        },
        updateQuery: (prev: ProductsResponse, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            products: {
              ...fetchMoreResult.products,
              edges: [
                ...prev.products.edges,
                ...fetchMoreResult.products.edges,
              ],
            }
          } as ProductsResponse;
        }
      });

      setDisplayLimit(displayLimit + limit);
    }
  };

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {products.map((product: Product) => (
          <Link href={`/products/${product.slug}`} key={product.id} className="group">
            <div className="w-full overflow-hidden rounded-lg bg-gray-100 aspect-w-1 aspect-h-1">
              {product.thumbnail && (
                <Image
                  src={product.thumbnail.url}
                  alt={product.thumbnail.alt || product.name}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
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

      {showLoadMore && hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMoreProducts}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
