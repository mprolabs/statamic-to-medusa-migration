import { client } from '../../../lib/graphql/client';
import { getCurrentLocale } from '../../../lib/graphql/client';
import { GET_PRODUCT_DETAILS } from '../../../lib/graphql/queries';
import { LanguageCodeEnum, ProductResponse } from '../../../lib/graphql/types';
import ProductDetail from '../../../components/ProductDetail';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = params;
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as LanguageCodeEnum;
  
  try {
    const { data } = await client.query<ProductResponse>({
      query: GET_PRODUCT_DETAILS,
      variables: {
        slug,
        channel,
        languageCode,
      },
    });
    
    const product = data?.product;
    
    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }
    
    return {
      title: `${product.name} | Saleor Store`,
      description: product.seoDescription || product.description?.substring(0, 155) || '',
    };
  } catch (error) {
    return {
      title: 'Product Details | Saleor Store',
    };
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const { region, language } = getCurrentLocale();
  const channel = region.toUpperCase();
  const languageCode = language.toUpperCase() as LanguageCodeEnum;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <a href="/products" className="text-sm text-indigo-600 hover:text-indigo-900">
          ← Back to Products
        </a>
      </div>
      
      <ProductDetail 
        slug={slug} 
        channel={channel} 
        languageCode={languageCode} 
      />
    </div>
  );
} 