import { client } from '@/lib/graphql/client';
import { getCurrentLocale } from '@/lib/graphql/client';
import { GET_CATEGORIES } from '@/lib/graphql/queries';
import { CategoriesResponse, LanguageCodeEnum } from '@/lib/graphql/types';
import ProductList from '@/components/ProductList';
import Link from 'next/link';

export const metadata = {
  title: 'Products | Saleor Storefront',
  description: 'Browse our latest products with multi-region and multi-language support',
};

export default async function ProductsPage() {
  // Get current locale information from the client utility
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as keyof typeof LanguageCodeEnum;
  
  // Fetch categories from the GraphQL API on the server
  const { data } = await client.query<CategoriesResponse>({
    query: GET_CATEGORIES,
    variables: {
      first: 10,
      channel,
      languageCode: LanguageCodeEnum[languageCode],
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar with categories */}
        <div className="w-full md:w-1/4 mb-6 md:mb-0 md:pr-8">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <ul className="space-y-2">
            {data?.categories?.edges.map(({ node }) => (
              <li key={node.id}>
                <Link 
                  href={`/categories/${node.slug}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {node.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Current Region</h3>
            <p className="text-sm text-gray-700">{region}</p>
            
            <h3 className="font-medium mt-4 mb-2">Current Language</h3>
            <p className="text-sm text-gray-700">{language}</p>
          </div>
        </div>
        
        {/* Main content with products */}
        <div className="w-full md:w-3/4">
          <h1 className="text-3xl font-bold mb-6">All Products</h1>
          <p className="mb-8 text-gray-600">
            Browsing products for region: <strong>{region}</strong> in language: <strong>{language}</strong>
          </p>
          
          {/* Client component that uses Apollo Client hooks */}
          <ProductList showLoadMore={true} limit={12} />
        </div>
      </div>
    </div>
  );
} 