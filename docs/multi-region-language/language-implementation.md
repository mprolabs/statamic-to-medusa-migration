---
layout: default
title: Language Implementation
description: Detailed guide on implementing multi-language support in the Saleor migration project
parent: Multi-Region & Multi-Language
---

# Multi-Language Implementation

This guide outlines the comprehensive approach to implementing multi-language support in the Statamic to Saleor migration project. The solution leverages Saleor's built-in translation capabilities combined with Next.js internationalization features.

## Language Requirements

Our implementation supports the following languages:

1. **Dutch (nl)**: Primary language for the Netherlands and Belgium storefronts
2. **German (de)**: Primary language for the Germany storefront
3. **French (fr)**: Secondary language for the Belgium storefront
4. **English (en)**: Fallback language for all storefronts

## Implementation Architecture

The multi-language implementation consists of several layers:

### 1. Data Layer (Saleor)

Saleor provides built-in translation capabilities for core entities:

- **Product Translations**: Names, descriptions, and metadata
- **Category Translations**: Names, descriptions, and metadata
- **Attribute Translations**: Names and values
- **Collection Translations**: Names and descriptions
- **Page Translations**: Titles and content

Each translation is associated with a specific language code (e.g., `NL`, `DE`, `FR`).

### 2. Content Layer (Optional CMS)

For rich content not directly handled by Saleor (blogs, complex pages), consider integrating a headless CMS with multi-language support:
- Strapi
- Contentful
- Prismic
- Sanity

### 3. Frontend Layer (Next.js)

Next.js provides robust internationalization (i18n) features:

- **Locale Detection**: Auto-detecting the user's preferred language
- **Locale Switching**: Allowing users to change languages
- **Domain-specific Locales**: Associating domains with specific languages
- **Static Generation**: Generating pages for each locale at build time

## Implementation Steps

### Step 1: Configure Saleor for Multi-Language Support

Saleor inherently supports translations for most entities. No special configuration is needed at the database level, but you need to create translations for your content:

1. **Via Dashboard**:
   - Navigate to a product/category/etc.
   - Find the "Translations" section
   - Click "Add translation"
   - Select a language and add translated content

2. **Via GraphQL API**:
   ```graphql
   mutation {
     productTranslate(
       id: "UHJvZHVjdDo0Nw==",
       input: {
         languageCode: DE,
         name: "Produktname auf Deutsch",
         description: "Produktbeschreibung auf Deutsch"
       }
     ) {
       product {
         id
         name
         translations {
           languageCode
           name
         }
       }
     }
   }
   ```

### Step 2: Configure Next.js for Multi-Language Support

Add i18n configuration to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    // Define all supported locales
    locales: ['en', 'nl', 'de', 'fr'],
    
    // Default locale when no specific locale matches
    defaultLocale: 'en',
    
    // Optional: Associate domains with specific locales
    domains: [
      {
        domain: 'domain-nl.com',
        defaultLocale: 'nl',
      },
      {
        domain: 'domain-be.com',
        defaultLocale: 'nl',
        // Locales supported on this domain
        locales: ['nl', 'fr'],
      },
      {
        domain: 'domain-de.com',
        defaultLocale: 'de',
      },
    ],
    
    // Optional: Locale detection strategy
    localeDetection: true,
  },
  // Other Next.js config...
};

module.exports = nextConfig;
```

### Step 3: Create Language Switching Component

Implement a language switcher component:

```jsx
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, locales, asPath } = router;
  
  return (
    <div className="language-switcher">
      <ul>
        {locales.map((l) => (
          <li key={l} className={l === locale ? 'active' : ''}>
            <Link href={asPath} locale={l}>
              <a>{getLanguageName(l)}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getLanguageName(locale) {
  const names = {
    en: 'English',
    nl: 'Nederlands',
    de: 'Deutsch',
    fr: 'Français',
  };
  return names[locale] || locale;
}
```

### Step 4: Fetch Data with Language Context

When fetching data from Saleor, include the language code:

```jsx
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';

// Map Next.js locale codes to Saleor language codes
const localeToLanguageCode = {
  en: 'EN',
  nl: 'NL',
  de: 'DE',
  fr: 'FR',
};

export default function ProductDetail({ productId }) {
  const { locale } = useRouter();
  const languageCode = localeToLanguageCode[locale] || 'EN';
  
  const GET_PRODUCT = gql`
    query GetProduct($id: ID!, $languageCode: LanguageCodeEnum!) {
      product(id: $id) {
        id
        name
        description
        translation(languageCode: $languageCode) {
          id
          name
          description
        }
      }
    }
  `;
  
  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: {
      id: productId,
      languageCode,
    },
  });
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  const product = data.product;
  const translatedName = product.translation?.name || product.name;
  const translatedDescription = product.translation?.description || product.description;
  
  return (
    <div>
      <h1>{translatedName}</h1>
      <div>{translatedDescription}</div>
    </div>
  );
}
```

### Step 5: Create Language-Specific Static Pages

For static pages, use Next.js' static generation features with locale support:

```jsx
// pages/about.js
export default function About({ translations }) {
  return (
    <div>
      <h1>{translations.title}</h1>
      <p>{translations.content}</p>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  // Load translations for the specific locale
  const translations = await import(`../locales/${locale}/about.json`);
  
  return {
    props: {
      translations: translations.default,
    },
  };
}
```

Structure your locale files like this:

```
/locales
  /en
    about.json
  /nl
    about.json
  /de
    about.json
  /fr
    about.json
```

### Step 6: Implement a Translation System for UI Elements

For UI strings, use a translation library like `next-i18next`:

1. Install the library:
   ```bash
   npm install next-i18next
   ```

2. Create a shared config:
   ```javascript
   // next-i18next.config.js
   module.exports = {
     i18n: {
       defaultLocale: 'en',
       locales: ['en', 'nl', 'de', 'fr'],
     },
   };
   ```

3. Create translation files:
   ```json
   // /public/locales/en/common.json
   {
     "header": {
       "search": "Search",
       "cart": "Cart",
       "account": "Account"
     },
     "footer": {
       "about": "About Us",
       "contact": "Contact",
       "terms": "Terms and Conditions"
     }
   }
   ```

4. Use translations in components:
   ```jsx
   import { useTranslation } from 'next-i18next';
   
   export default function Header() {
     const { t } = useTranslation('common');
     
     return (
       <header>
         <nav>
           <a href="/search">{t('header.search')}</a>
           <a href="/cart">{t('header.cart')}</a>
           <a href="/account">{t('header.account')}</a>
         </nav>
       </header>
     );
   }
   ```

## Migration Considerations

When migrating from Statamic to Saleor, special attention must be given to preserving language variants:

1. **Mapping Languages**: 
   - Map Statamic language codes to Saleor language codes
   - Create a mapping table to track the relationships

2. **Content Extraction**:
   - Extract content for each language variant from Statamic
   - Maintain language context throughout the extraction process

3. **Transformation**:
   - Transform content while preserving language variants
   - Ensure proper encoding of special characters

4. **Loading**:
   - Load translations into Saleor using the appropriate language codes
   - Verify that all translations are loaded correctly

## SEO Considerations

Proper SEO implementation for multi-language sites:

1. **Language-Specific URLs**:
   - Use path prefixes (/nl/products, /de/products) or
   - Use domain-specific routing (domain-nl.com, domain-de.com)

2. **Hreflang Tags**:
   - Add appropriate hreflang tags to indicate language variations
   - Implement in `_document.js` or in each page component

   ```jsx
   import Head from 'next/head';
   import { useRouter } from 'next/router';
   
   export default function ProductPage({ product }) {
     const { locales, defaultLocale, asPath } = useRouter();
     const canonicalUrl = `https://yourdomain.com${asPath}`;
     
     return (
       <>
         <Head>
           <link rel="canonical" href={canonicalUrl} />
           {locales.map((locale) => (
             <link
               key={locale}
               rel="alternate"
               hrefLang={locale}
               href={`https://${locale === 'nl' ? 'domain-nl.com' : 
                       locale === 'de' ? 'domain-de.com' : 
                       locale === 'fr' ? 'domain-be.com/fr' : 
                       'domain-be.com'}${asPath}`}
             />
           ))}
         </Head>
         {/* Page content */}
       </>
     );
   }
   ```

3. **Meta Tags**:
   - Ensure title, description, and other meta tags are language-specific
   - Include language-specific keywords where appropriate

## Testing Multi-Language Implementation

Comprehensive testing strategy for multi-language features:

1. **Translation Coverage Tests**:
   - Verify all translatable content has translations in each required language
   - Check for missing translations in the UI

2. **Language Switching Tests**:
   - Test language switching functionality
   - Verify URL structure changes appropriately
   - Ensure state persistence when switching languages

3. **Language Detection Tests**:
   - Test browser language detection
   - Verify domain-specific language defaults

4. **SEO Tests**:
   - Verify hreflang tags are correct
   - Check canonical URLs
   - Test language-specific meta tags

5. **Performance Tests**:
   - Measure performance impact of multi-language support
   - Test loading times for translated content

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Missing translations | Implement fallback mechanism to default language |
| Incorrect language detection | Review configuration, test with different browser settings |
| SEO issues with multiple languages | Ensure proper hreflang tags and canonical URLs |
| Performance impact of translation loading | Implement efficient translation loading strategies |
| Inconsistent UI when switching languages | Ensure consistent layout regardless of text length variations |

## Advanced Language Features

For even more sophisticated language support:

1. **RTL Language Support**:
   - Configure CSS for right-to-left languages if needed in the future
   - Implement RTL-aware components

2. **Language-Specific Formatting**:
   - Format dates, numbers, and currencies according to locale
   - Use `Intl` API for consistent formatting

3. **Content Adaptations**:
   - Adapt content or features based on language/cultural preferences
   - Implement region-specific promotions or campaigns

4. **Translation Management System**:
   - Consider implementing a workflow for managing translations
   - Integrate with professional translation services if needed 