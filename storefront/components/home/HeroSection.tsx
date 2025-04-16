import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeroSectionProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  imageUrl: string
}

export default function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageUrl
}: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gray-100">
      <div className="container py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              {subtitle}
            </p>
            <div>
              <Link
                href={ctaLink}
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-md transition-colors"
              >
                {ctaText}
              </Link>
            </div>
          </div>

          {/* Image - using a simple img for now, would use next/image in production */}
          <div className="relative h-64 md:h-auto">
            {/* Fallback if Next.js Image doesn't work in this environment */}
            <div className="relative h-full min-h-[320px] rounded-lg overflow-hidden shadow-lg">
              <img
                src={imageUrl || '/placeholder-hero.jpg'}
                alt="Hero image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
