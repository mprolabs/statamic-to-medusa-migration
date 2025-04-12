# System Architecture Document

## Overview

This document outlines the system architecture for the migration from Statamic CMS with Simple Commerce to Medusa.js with Strapi CMS. The system is designed to support multi-region and multi-language capabilities across multiple domains.

## System Components

### 1. Core Commerce Engine (Medusa.js)

**Purpose**: Handle all e-commerce functionality including products, orders, cart, checkout, and payments.

**Key Components**:
- **Product Service**: Manages product catalog, variants, pricing, and availability
- **Cart Service**: Handles shopping cart operations and calculations
- **Order Service**: Processes and manages orders
- **Payment Service**: Integrates with payment providers
- **Shipping Service**: Manages shipping options and calculations
- **Customer Service**: Handles customer accounts and profiles
- **Region Service**: Manages region-specific configurations (crucial for multi-region support)

**Interfaces**:
- RESTful API for frontend consumption
- Admin API for backend management
- Event system for internal communication

### 2. Content Management System (Strapi)

**Purpose**: Manage all content-related data including pages, blog posts, and marketing content.

**Key Components**:
- **Content Types Service**: Defines and manages content structures
- **Content API**: Provides access to content data
- **Media Library**: Manages images and other media assets
- **i18n System**: Handles multi-language content

**Interfaces**:
- GraphQL API for flexible content queries
- REST API for standard CRUD operations
- Admin UI for content management

### 3. Frontend Application (Next.js)

**Purpose**: Deliver the user-facing application with support for multiple regions and languages.

**Key Components**:
- **Routing System**: Handles multi-region and multi-language URL patterns
- **Product Browser**: Displays product listings and details
- **Cart Components**: Manages the shopping experience
- **Checkout Flow**: Guides users through the purchase process
- **CMS Components**: Renders content from Strapi
- **Authentication UI**: Handles user login and registration
- **Region Selector**: Allows users to switch between regional stores

**Interfaces**:
- User Interface for customer interaction
- API clients for Medusa.js and Strapi communication

### 4. Data Migration Service

**Purpose**: Facilitate the one-time migration of data from Statamic to Medusa.js and Strapi.

**Key Components**:
- **Extraction Scripts**: Extract data from Statamic's flat files
- **Transformation Logic**: Convert data to the target schema
- **Loading Scripts**: Import data into Medusa.js and Strapi
- **Validation Tools**: Ensure data integrity during migration

**Interfaces**:
- CLI for executing migration tasks
- Logging system for tracking migration progress and issues

### 5. API Gateway

**Purpose**: Provide a unified entry point for all API requests and handle cross-cutting concerns.

**Key Components**:
- **Routing**: Direct requests to appropriate services
- **Authentication**: Verify user identity and permissions
- **Rate Limiting**: Prevent abuse of the API
- **Caching**: Improve performance for common requests
- **Request/Response Transformation**: Adapt API formats as needed

**Interfaces**:
- RESTful API for client applications
- Service discovery for backend services

### 6. Infrastructure Services

**Purpose**: Support the core application components with essential infrastructure services.

**Key Components**:
- **Database Systems**: PostgreSQL for Medusa.js and Strapi
- **Search Engine**: MeiliSearch or Algolia for product and content search
- **CDN**: Content delivery network for static assets and edge caching
- **Media Storage**: S3 or similar for media assets
- **Monitoring & Logging**: Track system health and performance

**Interfaces**:
- Internal APIs for application components
- Management interfaces for DevOps

## Component Relationships

```
┌────────────────┐     ┌────────────────┐
│                │     │                │
│  Frontend App  │◄────┤  API Gateway   │
│   (Next.js)    │     │                │
│                │     │                │
└───────┬────────┘     └───────┬────────┘
        │                      │
        │                      │
        │                      │
┌───────▼────────┐     ┌───────▼────────┐
│                │     │                │
│  Medusa.js     │◄────┤  Strapi CMS    │
│  Commerce      │     │                │
│                │     │                │
└───────┬────────┘     └───────┬────────┘
        │                      │
        │                      │
┌───────▼────────┐     ┌───────▼────────┐
│                │     │                │
│  PostgreSQL    │     │  PostgreSQL    │
│  (Commerce)    │     │  (Content)     │
│                │     │                │
└────────────────┘     └────────────────┘
```

## Multi-Region and Multi-Language Support

### Region Support (through Medusa.js)
- Each region (Netherlands, Belgium, Germany) will be configured as a separate store in Medusa.js
- Region-specific settings include:
  - Tax rates
  - Shipping options
  - Payment methods
  - Pricing

### Language Support (through Strapi and Next.js)
- Content in Strapi will be managed with language variants
- Frontend will use i18n support in Next.js
- URL structure will include language prefixes
- User preferences for language will be stored and respected

## Cross-Cutting Concerns

### Authentication and Authorization
- JWT-based authentication system
- Role-based access control for admin functions
- Customer accounts with secure password storage
- Region-specific customer accounts

### Security
- HTTPS for all communications
- API rate limiting
- Input validation
- CSRF protection
- PCI compliance for payment processing

### Monitoring and Logging
- Centralized logging system
- Performance monitoring
- Error tracking
- Alerting system for critical issues

### Scalability
- Horizontal scaling for application tiers
- Database scaling strategies
- Caching layers for improved performance
- CDN for static asset delivery

## Deployment Architecture

The system will be deployed using Docker containers on a cloud platform with the following environment separation:

- **Development**: For active development and testing
- **Staging**: For pre-production validation
- **Production**: For live customer traffic

Each environment will be configured to support all regions and languages.

## Data Flow Diagrams

### 1. Product Browsing Flow
```
User → Frontend → API Gateway → Medusa.js Product Service → Database
                  └─→ Strapi Content API → Database
```

### 2. Checkout Flow
```
User → Frontend → API Gateway → Medusa.js Cart Service → Database
                  ↓
                  └─→ Medusa.js Payment Service → Payment Provider
                  ↓
                  └─→ Medusa.js Order Service → Database
                  ↓
                  └─→ Medusa.js Customer Service → Database
```

### 3. Content Delivery Flow
```
User → Frontend → API Gateway → Strapi Content API → Database
```

## Migration Strategy

The migration from Statamic to Medusa.js and Strapi will follow these steps:

1. Extract data from Statamic
2. Transform data to match target schemas
3. Load data into Medusa.js and Strapi
4. Validate data integrity
5. Test functionality in staging environment
6. Perform phased rollout by region

## Conclusion

This architecture supports all the requirements for the migration from Statamic with Simple Commerce to Medusa.js with Strapi, with particular attention to the multi-region and multi-language requirements. The component structure provides a clear separation of concerns, while the integration points ensure a cohesive system that delivers a seamless customer experience. 