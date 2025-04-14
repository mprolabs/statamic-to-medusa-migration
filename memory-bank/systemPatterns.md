# System Patterns: Statamic to Saleor Migration

## Architecture Overview

The migration project involves transitioning from a Statamic CMS with Simple Commerce to a headless architecture using Saleor. The architecture is designed to support multi-region e-commerce across three domains (Netherlands, Belgium, Germany) and multi-language content (Dutch and English).

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   NL Domain     │      │   BE Domain     │      │   DE Domain     │
│  nl.domain.com  │      │  be.domain.com  │      │  de.domain.com  │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       CDN / Edge Caching                        │
│                                                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   Next.js Storefronts (SSR/ISR)                 │
│                                                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     Saleor (GraphQL API)                        │
│                                                                 │
├─────────────────────────────┬───────────────────────────────────┤
│                             │                                   │
│    NL Channel               │   BE Channel         DE Channel   │
│                             │                                   │
└─────────────────────────────┴───────────────────────────────────┘
```

### Key Architectural Decisions

1. **Single Saleor Instance with Channel-Based Multi-Region**
   - One Saleor instance serves all regions
   - Regions implemented as separate Channels within Saleor
   - Each Channel has region-specific configurations (pricing, taxation, shipping)
   - Data isolation achieved through Channel filters

2. **Next.js Multi-Domain Frontend**
   - Individual Next.js applications for each domain/region
   - Shared component library for consistency
   - Region-specific configurations via environment variables
   - ISR (Incremental Static Regeneration) for performance optimization

3. **Multi-Language Implementation**
   - Leveraging Saleor's built-in translation capabilities
   - Language preference detected and persisted in user sessions
   - Content served in appropriate language based on user preference and/or URL

4. **Edge Caching Strategy**
   - CDN deployment for static assets
   - Edge caching configured per region
   - Cache invalidation triggered by content updates

## Component Architecture

### Saleor Core

```
┌─────────────────────────────────────────────────────────────────┐
│                        Saleor Core                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │   Product   │   │    Order    │   │  Customer   │           │
│  │   Module    │   │   Module    │   │   Module    │           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │   Checkout  │   │   Payment   │   │    Gift     │           │
│  │   Module    │   │   Module    │   │    Cards    │           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │  Shipping   │   │     Tax     │   │  Discount   │           │
│  │   Module    │   │   Module    │   │   Module    │           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                 │
│  ┌─────────────────────────┐   ┌─────────────────────────┐     │
│  │      Translations       │   │      Channel            │     │
│  │                         │   │      Management         │     │
│  └─────────────────────────┘   └─────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Next.js Storefront

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Storefront                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │   Product   │   │    Cart     │   │  Checkout   │           │
│  │    Pages    │   │  Components │   │   Flow      │           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │   Account   │   │  Category   │   │   Search    │           │
│  │    Pages    │   │    Pages    │   │    Pages    │           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                 │
│  ┌─────────────────────────┐   ┌─────────────────────────┐     │
│  │  Apollo GraphQL Client  │   │   Region & Language     │     │
│  │                         │   │       Middleware        │     │
│  └─────────────────────────┘   └─────────────────────────┘     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Shared Component Library                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. Channel-Based Region Isolation

- **Pattern**: Use of Saleor's Channel system to separate region-specific data
- **Implementation**: 
  - Each region (NL, BE, DE) configured as a separate Channel
  - Products associated with specific Channels
  - Channel-specific pricing, stock, and availability
  - API queries filtered by Channel

### 2. Multi-Language Content Management

- **Pattern**: Leveraging Saleor's built-in translation capabilities
- **Implementation**:
  - Products and variants with translations
  - Language-specific content fields
  - Language detection middleware in Next.js
  - Language toggle component for user selection

### 3. GraphQL-Based Data Communication

- **Pattern**: Apollo Client for GraphQL communication
- **Implementation**:
  - Query fragments for reusable data patterns
  - Custom hooks for data fetching
  - Optimistic UI updates for improved UX
  - Typed queries with TypeScript integration

### 4. Domain-Based Routing

- **Pattern**: Multi-domain architecture with shared codebase
- **Implementation**:
  - Domain-specific Next.js configuration
  - Environment-based configuration loading
  - Middleware for domain detection
  - Region-specific domain handling

### 5. Incremental Static Regeneration (ISR)

- **Pattern**: Combining static generation with dynamic updates
- **Implementation**:
  - Product pages pre-rendered at build time
  - Revalidation on data changes
  - On-demand regeneration for critical updates
  - Edge caching for optimized delivery

## Data Models

### Core Saleor Models

1. **Product**
   - Basic product information
   - Attributes and metadata
   - Channel availability
   - Translations for multilingual content

2. **ProductVariant**
   - Variant-specific information
   - Channel-specific pricing
   - Stock information
   - Digital content (if applicable)

3. **Channel**
   - Region-specific configuration
   - Currency settings
   - Tax settings
   - Shipping zones

4. **Collection**
   - Grouping of products
   - Channel availability
   - Translations for names and descriptions

5. **Order**
   - Order information
   - Channel context for region
   - Currency and pricing information
   - Shipping and billing details

6. **Customer**
   - User account information
   - Address book
   - Order history
   - Channel associations

## Integration Patterns

### Payment Processing

- **Pattern**: Channel-specific payment methods
- **Implementation**:
  - Mollie integration for NL/BE with region-specific methods
  - Stripe integration as fallback across all regions
  - Payment method availability determined by Channel

### Shipping Providers

- **Pattern**: Region-specific shipping options
- **Implementation**:
  - Channel-based shipping zone configuration
  - Integration with regional carrier APIs
  - Shipping rate calculation based on region

### Authentication

- **Pattern**: JWT-based authentication with cross-domain support
- **Implementation**:
  - Shared authentication state via secure cookies
  - Region-aware user sessions
  - Domain-specific authentication handling

## Testing Patterns

### BDD Testing Framework

- **Pattern**: Behavior-Driven Development with Cypress
- **Implementation**:
  - Gherkin syntax for business-readable tests
  - Parameterized tests for region/language combinations
  - Reusable step definitions
  - Custom commands for common operations

### Visual Regression Testing

- **Pattern**: Automated UI comparison across versions
- **Implementation**:
  - Screenshot comparison for key interfaces
  - Region and language-specific test cases
  - Responsive design testing

### E2E Testing

- **Pattern**: Full user journey testing
- **Implementation**:
  - Critical flow automation (checkout, account management)
  - Cross-region testing
  - Language switching testing
  - Payment integration testing with test accounts

## Deployment Architecture

```
┌────────────────────────────┐
│      CI/CD Pipeline        │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│    Docker Containers       │
├────────────────────────────┤
│ ┌──────────┐ ┌──────────┐  │
│ │  Saleor  │ │  Next.js │  │
│ │  Core    │ │Frontend(s)│  │
│ └──────────┘ └──────────┘  │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│    Kubernetes Cluster      │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│      CDN / Edge Cache      │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│      End Users             │
└────────────────────────────┘
```

## Migration Patterns

### Data Migration

- **Pattern**: Extract, Transform, Load (ETL) process
- **Implementation**:
  - Extraction scripts for Statamic data
  - Transformation to Saleor data models
  - Data validation and verification
  - Migration state tracking

### URL Structure Preservation

- **Pattern**: Comprehensive URL mapping and redirects
- **Implementation**:
  - URL structure analysis
  - Mapping table generation
  - Redirect implementation
  - SEO preservation

### User Data Migration

- **Pattern**: Staged user data transfer
- **Implementation**:
  - Account information migration
  - Password reset requirement
  - Order history preservation
  - Address book migration

## Monitoring and Observability

- **Pattern**: Comprehensive monitoring across services
- **Implementation**:
  - Application Performance Monitoring (APM)
  - Error tracking and alerting
  - User behavior analytics
  - Region-specific performance tracking

This document will be updated as the proof of concept progresses and more detailed patterns emerge.