# Multi-Language Implementation Approach

## Overview
This document outlines the approach for implementing multi-language support in our e-commerce platform as part of the migration from Statamic to Saleor. The implementation leverages Next.js i18n capabilities combined with Saleor's translation management to provide a seamless localized experience across different regions.

## Supported Languages

| Language | Code | Primary Region | Secondary Regions |
|----------|------|----------------|-------------------|
| Dutch | `nl` | Netherlands | Belgium |
| German | `de` | Germany | - |
| English | `en` | - | All (Fallback) |

## Key Components

### Frontend Language System
1. **Language Detection & Routing**
   - URL-based language detection (`/nl/products`, `/de/products`)
   - Cookie-based language preference storage
   - Browser language detection as fallback
   - SEO-friendly URLs with language prefixes

2. **Next.js i18n Configuration**
   - Configuration in `next.config.js` for i18n support
   ```javascript
   // next.config.js
   module.exports = {
     i18n: {
       locales: ['nl', 'de', 'en'],
       defaultLocale: 'nl',
       localeDetection: true,
       domains: [
         {
           domain: 'nl.domain.com',
           defaultLocale: 'nl',
         },
         {
           domain: 'be.domain.com',
           defaultLocale: 'nl',
         },
         {
           domain: 'de.domain.com',
           defaultLocale: 'de',
         },
       ],
     },
   };
   ```

3. **Language Middleware**
   - Next.js middleware for language detection and enforcement
   - Handles redirects for language-specific routes
   ```typescript
   // middleware.ts
   import { NextRequest, NextResponse } from 'next/server';
   
   export function middleware(request: NextRequest) {
     const { pathname, search } = request.nextUrl;
     const pathnameHasLocale = /^\/(?:nl|de|en)\//.test(pathname);
     
     if (!pathnameHasLocale) {
       // Get language preference from cookies or detect from headers
       const preferredLanguage = getPreferredLanguage(request);
       
       // Redirect to the same URL but with language prefix
       return NextResponse.redirect(
         new URL(`/${preferredLanguage}${pathname}${search}`, request.url)
       );
     }
     
     return NextResponse.next();
   }
   ```

4. **Language Switcher Component**
   - UI component for users to manually switch languages
   - Updates language preference cookie
   - Redirects to equivalent page in selected language

### Translation System

1. **Translation Management**
   - Structured JSON translation files for UI elements
   - Database-stored translations for dynamic content
   - Integration with translation services for workflow

2. **Translation Files Structure**
   ```
   /locales
     /nl
       common.json
       product.json
       checkout.json
     /de
       common.json
       product.json
       checkout.json
     /en
       common.json
       product.json
       checkout.json
   ```

3. **Translation Hook**
   ```typescript
   // useTranslation.ts
   import { useRouter } from 'next/router';
   import { useCallback } from 'react';
   
   export function useTranslation() {
     const router = useRouter();
     const { locale } = router;
     
     const t = useCallback((key: string, params?: Record<string, string>) => {
       // Implementation of translation lookup with fallback
       // and parameter substitution
     }, [locale]);
     
     return { t, locale };
   }
   ```

## Technical Implementation

### API Layer Implementation

1. **Language Context in GraphQL**
   - Language parameter in GraphQL queries
   ```graphql
   query ProductDetails($slug: String!, $channel: String!, $languageCode: LanguageCodeEnum!) {
     product(slug: $slug, channel: $channel) {
       id
       name(languageCode: $languageCode)
       description(languageCode: $languageCode)
       # Other translatable fields...
     }
   }
   ```

2. **Translation Fetching**
   - Server-side fetching of translations before rendering
   - Client-side loading of additional translations as needed

### Database Implementation

1. **Saleor Translation Tables**
   - Saleor maintains translations in dedicated tables
   - Entity-based translation structure:
     - ProductTranslation
     - ProductVariantTranslation
     - CategoryTranslation
     - AttributeTranslation

2. **Translation Fields**
   - Standard translatable fields include:
     - name
     - description
     - seoTitle
     - seoDescription

### SEO Optimization

1. **Language Meta Tags**
   - Proper HTML language attributes
   - Alternate language link tags
   ```html
   <html lang="nl">
   <head>
     <link rel="alternate" hreflang="nl" href="https://nl.domain.com/products/example" />
     <link rel="alternate" hreflang="de" href="https://de.domain.com/products/example" />
     <link rel="alternate" hreflang="en" href="https://nl.domain.com/en/products/example" />
   </head>
   ```

2. **Structured Data**
   - Language-specific structured data for products and content

### Migration Approach

1. **Translation Extraction**
   - Extract existing translations from Statamic
   - Map to Saleor's translation structure
   - Generate translation files for UI elements

2. **Translation Import**
   - Import product and category translations via Saleor API
   ```typescript
   // Example migration script for translations
   async function migrateProductTranslations(productId, translations) {
     for (const [languageCode, data] of Object.entries(translations)) {
       await client.mutate({
         mutation: UPDATE_PRODUCT_TRANSLATION,
         variables: {
           id: productId,
           input: {
             name: data.name,
             description: data.description,
             seoTitle: data.seoTitle,
             seoDescription: data.seoDescription,
             languageCode,
           },
         },
       });
     }
   }
   ```

3. **Content Migration**
   - Migrate static content with translations
   - Ensure language codes are properly mapped

### Testing Strategy

1. **Translation Coverage**
   - Verify all translatable content has translations in required languages
   - Test for missing translations and fallbacks

2. **Language Switching**
   - Test language switcher functionality across different pages
   - Verify URL structure changes appropriately

3. **SEO Verification**
   - Validate proper language meta tags
   - Test search engine indexing for language-specific pages

4. **Content Rendering**
   - Ensure proper rendering of special characters
   - Test right-to-left language support if needed in future

## Performance Considerations

1. **Translation Loading**
   - Lazy loading of translations to reduce initial bundle size
   - Caching of translations at edge/CDN

2. **Server-Side Rendering**
   - Pre-render language-specific content on the server
   - Hydrate with additional translations client-side as needed

## Future Enhancements

1. **Translation Management System**
   - Implement UI for content managers to update translations
   - Translation workflow with approval process

2. **Automated Translation**
   - Integration with machine translation for initial drafts
   - Human review workflow

3. **Language-Specific Assets**
   - Support for language-specific images and media
   - Culturally appropriate content per language

4. **Additional Languages**
   - Scalable architecture to support new languages without code changes 