import React from 'react';
import { getDictionary } from '../../lib/i18n';
import { getLanguageCodeFromLocale } from '../../lib/i18n/config';
import LanguageSelector from '../../components/LanguageSelector';
import RegionSelector from '../../components/RegionSelector';

export const metadata = {
  title: 'Language Demo',
  description: 'Demonstration of multi-language support',
};

// Server component that demonstrates multi-language capabilities
export default async function LanguageDemoPage({
  params
}: {
  params: { locale?: string }
}) {
  // Get the current locale from params or use default
  const locale = params?.locale || 'en';

  // Get the dictionary for the current locale
  const dictionary = await getDictionary(locale as any);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
              Multi-Language Support Demo
            </h1>

            <div className="flex justify-center space-x-4 mb-8">
              <LanguageSelector />
              <RegionSelector />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Current Language: <span className="text-indigo-600">{locale.toUpperCase()}</span>
              </h2>
              <p className="text-gray-600 mb-2">
                Language Code for GraphQL: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{getLanguageCodeFromLocale(locale as any)}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-gray-800">Common Translations</h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">Shop:</span> {dictionary.common.shop}
                  </li>
                  <li>
                    <span className="font-medium">Products:</span> {dictionary.common.products}
                  </li>
                  <li>
                    <span className="font-medium">Cart:</span> {dictionary.common.cart}
                  </li>
                  <li>
                    <span className="font-medium">Add to Cart:</span> {dictionary.common.addToCart}
                  </li>
                  <li>
                    <span className="font-medium">Search:</span> {dictionary.common.search}
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-gray-800">Product Translations</h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">Out of Stock:</span> {dictionary.product.outOfStock}
                  </li>
                  <li>
                    <span className="font-medium">In Stock:</span> {dictionary.product.inStock}
                  </li>
                  <li>
                    <span className="font-medium">Description:</span> {dictionary.product.description}
                  </li>
                  <li>
                    <span className="font-medium">Reviews:</span> {dictionary.product.reviews}
                  </li>
                  <li>
                    <span className="font-medium">Quantity:</span> {dictionary.product.quantity}
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <h3 className="text-lg font-medium mb-2 text-gray-800">Cart Translations</h3>
              <ul className="space-y-2">
                <li>
                  <span className="font-medium">Empty Cart:</span> {dictionary.cart.empty}
                </li>
                <li>
                  <span className="font-medium">Subtotal:</span> {dictionary.cart.subtotal}
                </li>
                <li>
                  <span className="font-medium">Shipping:</span> {dictionary.cart.shipping}
                </li>
                <li>
                  <span className="font-medium">Total:</span> {dictionary.cart.total}
                </li>
                <li>
                  <span className="font-medium">Remove:</span> {dictionary.cart.remove}
                </li>
              </ul>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>
                This page demonstrates the multi-language capabilities of the application.
                Change the language using the selector above to see translations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
