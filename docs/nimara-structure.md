# Nimara E-commerce Framework Structure

This document outlines the structure of the Nimara e-commerce framework that we've incorporated into our project.

## Repository Overview

Nimara is built as a modern monorepo using Turborepo, which organizes the codebase into separate packages and applications. This architecture promotes code reuse and separation of concerns.

## Directory Structure

```
storefront/
├── apps/                  # Applications
│   ├── automated-tests/   # Playwright test suite
│   ├── docs/              # Documentation site
│   ├── storefront/        # Main Next.js storefront application
│   └── stripe/            # Stripe payment integration
│
├── packages/              # Shared packages
│   ├── codegen/           # GraphQL code generation
│   ├── config/            # Shared configuration
│   ├── domain/            # Business domain logic
│   ├── eslint-config-custom/ # ESLint configuration
│   ├── infrastructure/    # Infrastructure code
│   ├── tsconfig/          # TypeScript configuration
│   └── ui/                # Shared UI components
│
├── .env.example           # Example environment variables
├── pnpm-workspace.yaml    # PNPM workspace configuration
└── turbo.json             # Turborepo configuration
```

## Key Components

### Applications

1. **Storefront Application** (`apps/storefront/`)
   - Built with Next.js 14
   - Uses React Server Components (RSC)
   - Implements Server Actions
   - Provides multi-region and multi-language support
   - Features user account management, product browsing, cart, and checkout

2. **Stripe Integration** (`apps/stripe/`)
   - Handles payment processing
   - Integrated with the Stripe Payment Element

3. **Documentation** (`apps/docs/`)
   - Documentation site for the project

4. **Automated Tests** (`apps/automated-tests/`)
   - Playwright test suite for end-to-end testing

### Packages

1. **UI Package** (`packages/ui/`)
   - Shared UI components based on shadcn/ui and Tailwind CSS
   - Reusable across applications

2. **Domain Package** (`packages/domain/`)
   - Core business logic
   - Data models and interfaces

3. **Infrastructure Package** (`packages/infrastructure/`)
   - API clients
   - Service integrations
   - Utility functions

4. **Code Generation** (`packages/codegen/`)
   - GraphQL code generation tools
   - Generates TypeScript types from GraphQL schema

## Technology Stack

- **Next.js 14**: React framework with App Router, Server Components, and Server Actions
- **TypeScript**: For type safety throughout the codebase
- **Tailwind CSS**: For styling
- **shadcn/ui**: UI component library based on Radix UI
- **GraphQL**: For data fetching from Saleor
- **Turborepo**: For monorepo management
- **pnpm**: Package manager for dependency management

## Multi-Region and Multi-Language Support

Nimara includes built-in support for:
- Multiple regions/countries through domain-based routing
- Multiple languages with internationalization
- Channel-based product and pricing management via Saleor

### Detailed Multi-Region Implementation

Nimara's multi-region capabilities are built on several key components:

1. **Channel-Based Architecture**
   - Leverages Saleor's Channel system to separate products, pricing, and availability by region
   - Each region (e.g., Netherlands, Belgium, Germany) is mapped to a dedicated Saleor Channel
   - Configuration through environment variables (e.g., `NEXT_PUBLIC_DEFAULT_CHANNEL`)

2. **Domain-Based Routing**
   - Supports multiple domains or subdomains for different regions
   - Next.js middleware detects region from the domain
   - Automatic redirection from base domain to region-specific domain

3. **Region Context Provider**
   - React context for accessing current region throughout the application
   - Provides region switching functionality
   - Automatically injects region context into GraphQL queries

4. **Region-Specific Content Delivery**
   - Fetches region-appropriate content based on channel
   - Handles region-specific pricing and availability
   - Ensures consistency between region and displayed content

5. **Edge Caching Strategy**
   - Region-aware caching headers for CDN optimization
   - Domain-specific caching rules
   - Efficient invalidation strategies per region

### Multi-Language Implementation

Nimara's multi-language support works in conjunction with its multi-region capabilities:

1. **URL-Based Language Detection**
   - Language codes in URL paths (e.g., `/nl/products`, `/de/products`)
   - SEO-friendly URL structure for language variants

2. **Next.js i18n Configuration**
   - Built-in support for multiple locales
   - Domain to language mapping
   - Default language per region

3. **Language Context Management**
   - React context for accessing current language
   - Language switching components
   - Persistence of language preference

4. **Translation System**
   - GraphQL queries with language parameters
   - JSON-based translation files for UI elements
   - Supports multiple translation loading strategies

5. **Language Middleware**
   - Next.js middleware handles language detection and enforcement
   - Redirects for language-specific routes
   - Fallback mechanisms for missing translations

## Integration with Saleor

Nimara is designed to work seamlessly with Saleor's multi-region capabilities:

1. **GraphQL Integration**
   - All queries include channel parameter for region-specific data
   - Language code parameters for translated content
   - Automatic channel and language injection based on current context

2. **Channel Configuration**
   - Each channel maintains region-specific settings:
     - Pricing in appropriate currency
     - Tax configurations
     - Shipping zones
     - Payment methods
     - Inventory availability

3. **API Layer**
   - Apollo Client configured with channel context
   - Headers include current channel information
   - Error handling respects region context

## Development Workflow

1. The project uses pnpm for package management
2. Turborepo handles the build and development workflow
3. Environment variables control configuration
4. Code generation creates TypeScript types from the GraphQL schema

## Next Steps

1. Configure environment variables
2. Install dependencies
3. Set up connection to our Saleor backend
4. Adapt for our specific multi-region and multi-language requirements 