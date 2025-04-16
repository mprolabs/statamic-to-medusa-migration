import { client } from '../../../lib/graphql/client';
import { getCurrentLocale } from '../../../lib/graphql/client';
import { GET_CATEGORY_WITH_PRODUCTS } from '../../../lib/graphql/queries';
import { LanguageCodeEnum, CategoryWithProductsResponse } from '../../../lib/graphql/types';
import ProductList from '../../../components/ProductList';
import Link from 'next/link';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = params;
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as LanguageCodeEnum;
  
  try {
    const { data } = await client.query<CategoryWithProductsResponse>({
      query: GET_CATEGORY_WITH_PRODUCTS,
      variables: {
        slug,
        first: 1, // We just need the category info for metadata
        channel,
        languageCode,
      },
    });
    
    const category = data?.category;
    
    if (!category) {
      return {
        title: 'Category Not Found',
      };
    }
    
    return {
      title: `${category.name} | Saleor Store`,
      description: category.seoDescription || category.description?.substring(0, 155) || `Browse ${category.name} products in our store`,
    };
  } catch (error) {
    return {
      title: 'Category | Saleor Store',
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as LanguageCodeEnum;
  
  const { data } = await client.query<CategoryWithProductsResponse>({
    query: GET_CATEGORY_WITH_PRODUCTS,
    variables: {
      slug,
      first: 1,
      channel,
      languageCode,
    },
  });
  
  const category = data?.category;
  
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
        <p className="mt-2 text-gray-600">The category you're looking for doesn't exist.</p>
        <div className="mt-8">
          <Link 
            href="/products"
            className="text-indigo-600 hover:text-indigo-900"
          >
            Browse all products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="py-4">
        <Link 
          href="/products" 
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          ← Back to All Products
        </Link>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <div 
              className="mt-2 text-gray-600"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}
        </div>
      </div>
      
      <ProductList 
        categorySlug={slug} 
        showLoadMore={true} 
        limit={12} 
      />
    </div>
  );
} 