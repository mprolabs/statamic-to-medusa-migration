---
layout: default
title: Nimara Migration Guide
parent: Migration
nav_order: 2
---

# Migrating to Nimara E-commerce Framework

This guide outlines the process for migrating our custom Next.js storefront to the Nimara e-commerce framework, a production-ready storefront built specifically for Saleor.

## Why Nimara?

After evaluating our current implementation against the Nimara e-commerce framework, we've determined that adopting Nimara will provide significant advantages:

1. **Production-Ready Architecture**: Nimara provides a well-structured monorepo using Turborepo with proper separation of concerns
2. **Complete Feature Set**: Includes user authentication, payment processing, and other advanced features
3. **Modern UI Components**: Uses shadcn/ui for accessible, customizable components
4. **Saleor Integration**: Built specifically for Saleor, with appropriate GraphQL implementation
5. **Testing Framework**: Includes automated testing with Playwright

## Migration Strategy

We are implementing a "Complete Migration to Nimara" approach with the following steps:

1. Rename our current `storefront` directory to `storefront-old`
2. Clone the Nimara repository into a new `storefront` directory
3. Port our custom multi-region and multi-language implementation to Nimara
4. Migrate our custom components and business logic
5. Ensure all current functionality continues to work

## Implementation Plan

### Phase 1: Setup (1-2 days)

1. **Prepare Current Codebase**
   ```bash
   mv storefront storefront-old
   ```

2. **Clone Nimara Repository**
   ```bash
   git clone https://github.com/mirumee/nimara-ecommerce.git storefront
   cd storefront
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update values to match our Saleor API endpoint and other configurations

5. **Verify Installation**
   ```bash
   pnpm run dev:storefront
   ```

### Phase 2: Core Integration (2-3 days)

1. **Analyze Nimara Structure**
   - Review the monorepo structure and component organization
   - Understand how Nimara handles GraphQL and state management

2. **Port GraphQL Client Configuration**
   - Adapt our region and language detection logic to Nimara's Apollo client setup
   - Ensure GraphQL queries include proper region and language parameters

3. **Adapt State Management**
   - Port our Zustand cart store to fit within Nimara's state management approach
   - Ensure persistence and multi-region support

4. **Configure Multi-Region Support**
   - Implement domain-based region detection
   - Configure region-specific settings
   - Ensure proper channel selection for each region

5. **Implement Multi-Language Support**
   - Configure language detection and switching
   - Ensure proper language code is passed to GraphQL queries
   - Implement language selection UI

### Phase 3: UI Migration (2-3 days)

1. **Component Analysis**
   - Create mapping between our custom components and Nimara/shadcn/ui equivalents
   - Identify components that need to be custom-built

2. **Port Custom Components**
   - Migrate each component to use shadcn/ui where appropriate
   - Adapt styling to maintain consistent design
   - Implement responsive layouts

3. **Page Structure Migration**
   - Port or recreate each page type
   - Ensure routing handles multi-region and multi-language URLs
   - Implement SEO optimizations

4. **Implement Custom Features**
   - Port any custom features not available in Nimara
   - Extend existing Nimara components where needed

### Phase 4: Testing & Refinement (1-2 days)

1. **Functional Testing**
   - Test all core functionality across regions and languages
   - Verify shopping flow from product listing to checkout

2. **Performance Testing**
   - Compare performance metrics with original implementation
   - Optimize rendering and data fetching

3. **Cross-Browser Testing**
   - Verify functionality across major browsers
   - Ensure responsive design works consistently

4. **Final Adjustments**
   - Address any issues discovered during testing
   - Fine-tune styling and interactions

## Component Migration Map

| Current Component | Nimara/shadcn/ui Equivalent | Notes |
|-------------------|----------------------------|-------|
| `Header.tsx` | Nimara Header component | Adapt region/language selector |
| `ProductList.tsx` | Nimara Products components | Ensure multi-region filtering |
| `ProductDetail.tsx` | Nimara ProductDetails | Adapt variant selection |
| `CartDrawer.tsx` | Nimara Cart components | Port Zustand integration |
| `CheckoutPage.tsx` | Nimara Checkout components | Ensure region-specific checkout |

## Code Structure Comparison

### Current Structure
```
storefront/
├── components/ - UI components
├── lib/
│   ├── graphql/ - GraphQL queries and types
│   └── stores/ - Zustand state stores
├── app/ - Next.js App Router pages
└── public/ - Static assets
```

### Nimara Structure
```
nimara-ecommerce/
├── apps/
│   ├── docs/ - Documentation site
│   └── storefront/ - Next.js storefront
│       ├── app/ - Next.js App Router pages
│       ├── components/ - UI components
│       ├── lib/ - Utilities and shared code
│       └── public/ - Static assets
├── packages/
│   ├── ui/ - UI components
│   ├── config/ - Shared configuration
│   └── tsconfig/ - TypeScript configuration
```

## Multi-Region Implementation

Our multi-region approach within Nimara will follow this pattern:

```javascript
// Region detection middleware in apps/storefront/lib/middleware.ts
export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host');
  
  // Detect region from hostname
  let region = 'default';
  if (hostname.includes('nl.')) {
    region = 'nl';
  } else if (hostname.includes('de.')) {
    region = 'de';
  } else if (hostname.includes('be.')) {
    region = 'be';
  }
  
  // Store region in headers/cookies
  const response = NextResponse.next();
  response.cookies.set('region', region);
  
  return response;
}
```

## Multi-Language Implementation

Our multi-language implementation within Nimara will use URL path prefixes:

```javascript
// Language detection in apps/storefront/lib/language.ts
export function detectLanguage(path) {
  const segments = path.split('/').filter(Boolean);
  const langCodes = ['en', 'nl', 'de', 'fr'];
  
  if (segments.length > 0 && langCodes.includes(segments[0])) {
    return segments[0];
  }
  
  return 'en'; // Default
}

// Usage in GraphQL client
export function getGqlClient(lang, region) {
  return new ApolloClient({
    // ...configuration
    defaultOptions: {
      query: {
        variables: {
          languageCode: lang.toUpperCase(),
          channel: region.toUpperCase()
        }
      }
    }
  });
}
```

## Migration Checklist

- [ ] Back up current storefront code
- [ ] Clone and set up Nimara repository
- [ ] Configure environment variables
- [ ] Port multi-region implementation
- [ ] Port multi-language implementation
- [ ] Migrate custom components
- [ ] Adapt state management
- [ ] Test and optimize performance
- [ ] Verify all functionality works across regions and languages
- [ ] Update documentation

## Rollback Plan

In case of critical issues, we can revert to the original implementation:

```bash
rm -rf storefront
mv storefront-old storefront
```

## Resources

- [Nimara Repository](https://github.com/mirumee/nimara-ecommerce)
- [Saleor Documentation](https://docs.saleor.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Turborepo Documentation](https://turbo.build/repo/docs)

---

*This guide will be updated throughout the migration process as we learn more about the specific implementation details and challenges.* 