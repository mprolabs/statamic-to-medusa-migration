# Using GraphQL with Next.js Components

This guide explains how to use the GraphQL queries with Next.js components in our Saleor-based e-commerce platform, with particular attention to multi-region and multi-language support.

## Table of Contents

- [Overview](#overview)
- [Available Queries](#available-queries)
- [Working with Apollo Client](#working-with-apollo-client)
- [Multi-Region Support](#multi-region-support)
- [Multi-Language Support](#multi-language-support)
- [Client Component Examples](#client-component-examples)
- [Server Component Examples](#server-component-examples)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)

## Overview

Our Saleor implementation uses Apollo Client to interact with the GraphQL API. The project includes:

1. **Pre-defined queries** - Located in `storefront/lib/graphql/queries.ts`
2. **TypeScript interfaces** - Located in `storefront/lib/graphql/types.ts`
3. **Apollo Client setup** - Located in `storefront/lib/graphql/client.ts`
4. **Context providers** - For region, language, and channel management

## Available Queries

The following GraphQL queries are available for your components:

| Query Name | Description | Parameters |
|------------|-------------|------------|
| `GET_FEATURED_PRODUCTS` | Fetches a curated list of featured products | `channel`, `languageCode` |
| `GET_PRODUCTS` | Fetches products with filtering, sorting, and pagination | `first`, `after`, `channel`, `languageCode`, `filter`, `sortBy`, `sortDirection` |
| `GET_PRODUCT_DETAILS` | Fetches detailed information about a specific product | `slug`, `channel`, `languageCode` |
| `GET_CATEGORIES` | Fetches available product categories | `first`, `channel`, `languageCode` |
| `GET_CATEGORY_WITH_PRODUCTS` | Fetches a specific category with its products | `slug`, `first`, `after`, `channel`, `languageCode` |

## Working with Apollo Client

The Apollo Client is configured to automatically handle:
- Authentication tokens
- Region and language context
- Server-side rendering (SSR)

### Using Queries in Client Components

In client components, you can use the Apollo Client hooks directly:

```tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_FEATURED_PRODUCTS } from '@/lib/graphql/queries';
import { ProductsResponse, LanguageCodeEnum } from '@/lib/graphql/types';

const FeaturedProducts = () => {
  const { data, loading, error } = useQuery<ProductsResponse>(GET_FEATURED_PRODUCTS, {
    variables: {
      channel: 'DEFAULT', // This will be replaced automatically by channelLink
      languageCode: LanguageCodeEnum.EN, // This will be replaced automatically by channelLink
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data?.products.edges.map(({ node }) => (
        <div key={node.id} className="border p-4">
          <img src={node.thumbnail?.url} alt={node.thumbnail?.alt || node.name} />
          <h3>{node.name}</h3>
          <p>{node.pricing?.priceRange.start.gross.amount} {node.pricing?.priceRange.start.gross.currency}</p>
        </div>
      ))}
    </div>
  );
};

export default FeaturedProducts;
```

## Multi-Region Support

The `channelLink` in our Apollo Client automatically injects channel information based on the current region:

```tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/lib/graphql/queries';
import { ProductsResponse } from '@/lib/graphql/types';
import { useRegion } from '@/lib/context/RegionContext';

const ProductList = () => {
  const { currentRegion } = useRegion();
  
  const { data, loading, error } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    variables: {
      first: 12,
      // No need to specify channel or languageCode as they're injected automatically
    },
  });

  // Component implementation...
};
```

## Multi-Language Support

Language context is handled automatically by the Apollo Client. However, if you need to manually specify a language:

```tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_PRODUCT_DETAILS } from '@/lib/graphql/queries';
import { ProductResponse, LanguageCodeEnum } from '@/lib/graphql/types';
import { useLanguage } from '@/lib/context/LanguageContext';

const ProductDetail = ({ slug }: { slug: string }) => {
  const { currentLanguage } = useLanguage();
  
  // Map the language code from context to enum
  const languageCode = currentLanguage.code.toUpperCase() as keyof typeof LanguageCodeEnum;
  
  const { data, loading, error } = useQuery<ProductResponse>(GET_PRODUCT_DETAILS, {
    variables: {
      slug,
      languageCode: LanguageCodeEnum[languageCode],
    },
  });

  // Component implementation...
};
```

## Client Component Examples

### Product Card Component

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/graphql/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square relative">
          {product.thumbnail?.url && (
            <img 
              src={product.thumbnail.url} 
              alt={product.thumbnail.alt || product.name}
              className="object-cover w-full h-full"
            />
          )}
          {product.pricing?.onSale && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
              Sale
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900">{product.name}</h3>
          <p className="text-gray-700">
            {product.pricing?.priceRange.start.gross.amount} 
            {product.pricing?.priceRange.start.gross.currency}
          </p>
          {product.category && (
            <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
```

### Category Browse Component

```tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_CATEGORY_WITH_PRODUCTS } from '@/lib/graphql/queries';
import { CategoryWithProductsResponse } from '@/lib/graphql/types';
import ProductCard from '@/components/ProductCard';
import { useState } from 'react';

interface CategoryBrowseProps {
  slug: string;
}

const CategoryBrowse: React.FC<CategoryBrowseProps> = ({ slug }) => {
  const [productsToShow, setProductsToShow] = useState(8);
  
  const { data, loading, error, fetchMore } = useQuery<CategoryWithProductsResponse>(
    GET_CATEGORY_WITH_PRODUCTS,
    {
      variables: {
        slug,
        first: productsToShow,
      },
    }
  );

  const handleLoadMore = () => {
    if (data?.category?.products.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          after: data.category.products.pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            category: {
              ...fetchMoreResult.category,
              products: {
                ...fetchMoreResult.category.products,
                edges: [
                  ...prev.category.products.edges,
                  ...fetchMoreResult.category.products.edges,
                ],
              },
            },
          };
        },
      });
    } else {
      setProductsToShow(productsToShow + 8);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  if (!data?.category) return <div className="p-8 text-center">Category not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{data.category.name}</h1>
        {data.category.description && (
          <p className="mt-2 text-gray-600">{data.category.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {data.category.products.edges.map(({ node }) => (
          <ProductCard key={node.id} product={node} />
        ))}
      </div>
      
      {data.category.products.pageInfo.hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryBrowse;
```

## Server Component Examples

For server components, we need to use a different approach since we can't use hooks directly:

```tsx
// app/products/page.tsx
import { client } from '@/lib/graphql/client';
import { GET_PRODUCTS } from '@/lib/graphql/queries';
import { ProductsResponse, LanguageCodeEnum } from '@/lib/graphql/types';
import ProductCard from '@/components/ProductCard';
import { getCurrentLocale } from '@/lib/graphql/client';

export default async function ProductsPage() {
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as keyof typeof LanguageCodeEnum;
  
  const { data } = await client.query<ProductsResponse>({
    query: GET_PRODUCTS,
    variables: {
      first: 12,
      channel,
      languageCode: LanguageCodeEnum[languageCode],
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {data.products.edges.map(({ node }) => (
          <ProductCard key={node.id} product={node} />
        ))}
      </div>
    </div>
  );
}
```

### Dynamic Product Page

```tsx
// app/products/[slug]/page.tsx
import { client } from '@/lib/graphql/client';
import { GET_PRODUCT_DETAILS } from '@/lib/graphql/queries';
import { ProductResponse, LanguageCodeEnum } from '@/lib/graphql/types';
import { getCurrentLocale } from '@/lib/graphql/client';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as keyof typeof LanguageCodeEnum;
  
  const { data } = await client.query<ProductResponse>({
    query: GET_PRODUCT_DETAILS,
    variables: {
      slug: params.slug,
      channel,
      languageCode: LanguageCodeEnum[languageCode],
    },
  });

  if (!data.product) return { title: 'Product Not Found' };
  
  return {
    title: data.product.seoTitle || data.product.name,
    description: data.product.seoDescription || data.product.description,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as keyof typeof LanguageCodeEnum;
  
  const { data } = await client.query<ProductResponse>({
    query: GET_PRODUCT_DETAILS,
    variables: {
      slug: params.slug,
      channel,
      languageCode: LanguageCodeEnum[languageCode],
    },
  });

  if (!data.product) notFound();

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {data.product.media && data.product.media.length > 0 ? (
            <img 
              src={data.product.media[0].url} 
              alt={data.product.media[0].alt || data.product.name}
              className="w-full rounded-lg"
            />
          ) : (
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{data.product.name}</h1>
          <div className="mt-4 text-xl">
            {data.product.pricing?.priceRange.start.gross.amount} 
            {data.product.pricing?.priceRange.start.gross.currency}
          </div>
          
          {data.product.description && (
            <div className="mt-6 prose" dangerouslySetInnerHTML={{ __html: data.product.description }} />
          )}
          
          {data.product.variants && data.product.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Variants</h3>
              <div className="grid grid-cols-2 gap-2">
                {data.product.variants.map((variant) => (
                  <div key={variant.id} className="border p-3 rounded">
                    <p>{variant.name}</p>
                    <p className="text-sm text-gray-600">
                      {variant.pricing?.price?.gross.amount} 
                      {variant.pricing?.price?.gross.currency}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <AddToCartButton product={data.product} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Implementation Examples

We have created the following implementation examples in this project:

1. **ProductList Component** (`storefront/components/ProductList.tsx`)
   - A reusable client component that fetches and displays products
   - Supports filtering by category
   - Includes pagination with "Load More" functionality
   - Automatically handles region and language context

2. **Products Page** (`storefront/app/products/page.tsx`)
   - A server component that fetches categories on the server
   - Displays the current region and language
   - Uses the ProductList client component for product display
   - Demonstrates the pattern of combining server and client components

## Best Practices

When working with GraphQL in our Next.js application, follow these best practices:

### Server vs. Client Components

- **Server Components** should:
  - Fetch initial data directly using the client
  - Pass data to client components as props when possible
  - Handle metadata generation and SEO concerns
  - Avoid using context directly (pass data down instead)

- **Client Components** should:
  - Be marked with `'use client'` directive
  - Use Apollo hooks for dynamic data fetching, filtering, and pagination
  - Handle user interactions and state
  - Access context providers when needed

### Performance Optimization

1. **Pagination and Data Loading**
   - Use cursor-based pagination with Apollo's `fetchMore`
   - Implement "Load More" buttons instead of infinite scroll for better performance
   - Consider using skeleton loaders for better perceived performance

2. **Caching Strategy**
   - Use appropriate cache policies based on data volatility
   - For frequently changing data, consider `network-only` fetch policy
   - For stable data, use `cache-first` policy

3. **Query Optimization**
   - Only request fields you need in your GraphQL queries
   - Use fragments to share common field selections
   - Consider implementing query batching for related queries

### Multi-Region Considerations

1. **Region Detection**
   - Let the RegionContext handle detection based on domain
   - Allow manual region switching as a fallback
   - Consider persisting user region preferences

2. **Channel-Based Filtering**
   - Use region-specific channels for correct pricing and availability
   - Pass the correct channel to all queries
   - Use the channel middleware to automatically inject the channel parameter

### Language Handling

1. **URL Structure**
   - Consider language in URL paths (e.g., `/en-US/products/`)
   - Use the Next.js i18n system for routing
   - Ensure language switching preserves the current page

2. **Content Localization**
   - Always pass the language parameter to GraphQL queries
   - Fall back to default language when translations are not available
   - Consider right-to-left (RTL) support for languages like Arabic 