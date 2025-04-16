import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saleor Store',
  description: 'E-commerce storefront powered by Saleor',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main>
            {children}
          </main>
          <footer className="bg-gray-50 mt-12">
            <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
              <p className="mt-8 text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} Saleor Store. All rights reserved.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
} 