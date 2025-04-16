import React from 'react';

export const metadata = {
  title: 'Checkout - Saleor Storefront',
  description: 'Complete your purchase',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        {children}
      </div>
    </div>
  );
}
