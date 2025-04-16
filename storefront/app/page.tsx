import React from 'react'
import ProductGrid from '@/components/product/ProductGrid'
import HeroSection from '@/components/home/HeroSection'
import FeaturedCategories from '@/components/home/FeaturedCategories'

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      <HeroSection 
        title="Welcome to Our Store"
        subtitle="Discover the best products across multiple regions"
        ctaText="Shop Now"
        ctaLink="/products"
        imageUrl="/hero-image.jpg"
      />
      
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">Featured Categories</h2>
        <FeaturedCategories />
      </div>
      
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <ProductGrid />
      </div>
    </div>
  )
} 