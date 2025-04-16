import { client } from '../../lib/graphql/client';
import { getCurrentLocale } from '../../lib/graphql/client';
import { GET_CATEGORIES } from '../../lib/graphql/queries';
import { CategoriesResponse, LanguageCodeEnum } from '../../lib/graphql/types';
import ProductList from '../../components/ProductList';
import Link from 'next/link';

export const metadata = {
  title: 'Products | Saleor Store',
  description: 'Browse all products in our store',
};

export default async function ProductsPage() {
  // Get current region and language
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as LanguageCodeEnum;
  
  // Fetch categories on the server
  const { data } = await client.query<CategoriesResponse>({
    query: GET_CATEGORIES,
    variables: {
      first: 20,
      channel,
      languageCode,
    },
  });
  
  const categories = data?.categories?.edges?.map(edge => edge.node) || [];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar with categories */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="font-medium text-gray-900 mb-4">Region & Language</h2>
            <p className="text-sm text-gray-600 mb-1">Region: {region}</p>
            <p className="text-sm text-gray-600 mb-6">Language: {language}</p>
            
            <h2 className="font-medium text-gray-900 mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/products" 
                  className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  All Products
                </Link>
              </li>
              {categories.map(category => (
                <li key={category.id}>
                  <Link 
                    href={`/categories/${category.slug}`}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <h2 className="text-xl font-medium mb-2">All Products</h2>
          <p className="text-gray-600 mb-6">Showing products for region {region} in {language}</p>
          
          {/* Client component that loads products */}
          <ProductList showLoadMore={true} limit={12} />
        </div>
      </div>
    </div>
  );
} 