import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { RegionProvider } from '@/lib/context/RegionContext'
import { LanguageProvider } from '@/lib/context/LanguageContext'
import { GraphQLClientProvider } from '@/lib/context/GraphQLClientContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saleor Storefront',
  description: 'Multi-region and multi-language e-commerce storefront powered by Saleor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RegionProvider>
          <LanguageProvider>
            <GraphQLClientProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </GraphQLClientProvider>
          </LanguageProvider>
        </RegionProvider>
      </body>
    </html>
  )
} 