'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/lib/graphql/queries';
import { ProductsResponse } from '@/lib/graphql/types';
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
  const [productsToShow, setProductsToShow] = React.useState(limit);
  
  // The Apollo client will automatically inject channel and language variables
  // based on the current region and language from context
  const { data, loading, error, fetchMore } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    variables: {
      first: productsToShow,
      filter: categorySlug ? { categories: [categorySlug] } : { isPublished: true, isAvailable: true },
    },
  });

  if (loading) return <div className="w-full p-8 text-center">Loading products...</div>;
  if (error) return <div className="w-full p-8 text-center text-red-500">Error: {error.message}</div>;
  if (!data?.products || data.products.edges.length === 0) return <div className="w-full p-8 text-center">No products found</div>;

  const loadMoreProducts = () => {
    if (data.products.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          after: data.products.pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          return {
            products: {
              ...fetchMoreResult.products,
              edges: [
                ...prev.products.edges,
                ...fetchMoreResult.products.edges,
              ],
            },
          };
        },
      });
    } else {
      setProductsToShow(productsToShow + limit);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {data.products.edges.map(({ node }) => (
          <div key={node.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/products/${node.slug}`}>
              <div className="aspect-square relative">
                {node.thumbnail?.url && (
                  <img 
                    src={node.thumbnail.url} 
                    alt={node.thumbnail.alt || node.name}
                    className="object-cover w-full h-full"
                  />
                )}
                {node.pricing?.onSale && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                    Sale
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{node.name}</h3>
                <p className="text-gray-700">
                  {node.pricing?.priceRange.start.gross.amount} 
                  {node.pricing?.priceRange.start.gross.currency}
                  
                  {node.pricing?.onSale && node.pricing?.discount && (
                    <span className="ml-2 text-red-500 text-sm">
                      Save {node.pricing.discount.gross.amount} {node.pricing.discount.gross.currency}
                    </span>
                  )}
                </p>
                {node.category && (
                  <p className="text-xs text-gray-500 mt-1">{node.category.name}</p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {showLoadMore && data.products.pageInfo.hasNextPage && (
        <div className="mt-10 text-center">
          <button
            onClick={loadMoreProducts}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList; 