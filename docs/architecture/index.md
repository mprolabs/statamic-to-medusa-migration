---
layout: default
title: Architecture
description: System architecture for the Statamic to Saleor migration with multi-region and multi-language support
include_in_nav: true
nav_order: 2
has_children: true
---

# System Architecture

## Overview

The architecture for the Statamic to Saleor migration consists of the following components:

1. **Frontend**: Next.js-based storefront that serves the customer-facing website across multiple domains and languages
2. **Commerce Platform**: Saleor Core providing comprehensive ecommerce functionality with multi-region support
3. **Data Migration Tools**: Custom scripts for migrating data from Statamic to Saleor with proper region and language mapping
4. **Infrastructure**: Multi-region deployment supporting three separate domains (Netherlands, Belgium, Germany)

## Core Architecture Principles

- **Separation of Concerns**: Clear separation between commerce functionality, content management, and presentation
- **API-First Approach**: All interactions between components happen through well-defined APIs
- **Multi-Region by Design**: Architecture supports multiple regions as a fundamental principle, not an afterthought
- **Language Flexibility**: Content and commerce data support multiple language variants throughout the system
- **Scalability**: Each component can scale independently based on demand
- **Maintainability**: Modular design allows for easier updates and modifications

## Commerce Platform: Saleor

Saleor will handle all commerce-related functionality:

- Product catalog management with multi-language support
- Cart processing with region-specific rules
- Checkout flow customized for each region
- Order management across all regions
- Customer accounts with cross-region capabilities
- Multi-region support via Channels feature
- Payment provider integration specific to each region
- Shipping options configured per region
- Tax calculations based on regional requirements

### Saleor Channel Architecture

Saleor's Channel feature is the foundation of our multi-region strategy:

- **Channel = Region**: Each region (Netherlands, Belgium, Germany) is implemented as a separate Saleor Channel
- **Channel-Specific Configuration**: Each Channel has its own:
  - Currency settings
  - Pricing strategies
  - Product availability
  - Shipping methods
  - Payment providers
  - Tax configurations
- **Shared Products**: Product catalog is shared across channels, with channel-specific visibility control
- **Centralized Management**: All channels can be managed from a single Saleor Dashboard

## Frontend Architecture

The frontend is implemented using Next.js, providing:

- Server-side rendering for optimal SEO
- Client-side interactions for a responsive user experience
- Multi-domain support through domain-specific deployments
- Language detection and switching capabilities
- Region-specific content and product presentation
- Optimized performance through static generation and incremental static regeneration
- Mobile-first responsive design

### Domain-Specific Configuration

Each domain has specific configurations:

- Domain-specific routing for different URLs across regions
- Region-specific content sourcing
- Language preferences and defaults
- Regional branding and design variations (if needed)
- Localized SEO metadata

## Integration Points

The system components interact through the following integration points:

- **GraphQL API**: The primary way to interact with Saleor for product information, cart operations, and checkout
- **Webhooks**: Event-driven notifications from Saleor to external systems
- **REST APIs**: For interactions with other services and data sources
- **Authentication Services**: Unified authentication across regions and domains

## Technology Stack

- **Saleor**: Open-source commerce platform serving as the core backend
- **Next.js**: React framework for building the storefront
- **GraphQL**: Query language for APIs, used for communication with Saleor
- **PostgreSQL**: Database used by Saleor for persistent storage
- **Redis**: Used for caching and session management
- **Docker**: Containerization for development and deployment
- **Kubernetes**: Optional for production orchestration
- **Content Delivery Network**: For optimized global content delivery

## Multi-Region Support

Saleor's Channel feature will be used to support multiple regions:

- Separate channel for each region (Netherlands, Belgium, Germany)
- Region-specific products, prices, and availability
- Multiple currencies (EUR, with region-specific formatting)
- Multiple languages (Dutch, French, German) with support for:
  - Product information in multiple languages
  - Content translations
  - Region-specific metadata
- Region-specific shipping and payment methods
- Tax configurations appropriate for each region

## Data Flow Architecture

The data flow between components follows these patterns:

1. **Customer Browsing**:
   - Client → Next.js → Saleor GraphQL API → PostgreSQL → Client
   - Content is served with appropriate region and language context

2. **Cart Operations**:
   - Client → Next.js → Saleor GraphQL API → Cart Storage → Client
   - Region-specific pricing, tax, and availability rules are applied

3. **Checkout Process**:
   - Client → Next.js → Saleor GraphQL API → Payment Providers → Order Processing
   - Region-specific payment methods and shipping options are presented

4. **Order Management**:
   - Admin → Saleor Dashboard → Order Services → Fulfillment Systems
   - Orders are managed with awareness of their originating region

## Security Architecture

- **Authentication**: JWT-based authentication for both customers and administrators
- **Authorization**: Role-based access control for administrative functions
- **Data Protection**: Encryption for sensitive data in transit and at rest
- **GDPR Compliance**: Data handling processes designed to comply with EU regulations
- **Cross-Domain Security**: Secure cross-domain authentication and data sharing

## Future Considerations

- Scaling strategy for high-traffic periods
- Caching strategy for improved performance
- Performance optimization for mobile users
- Monitoring and alerting system
- Backup and disaster recovery procedures
- Expansion to additional regions and languages

See [Architecture Diagram](architecture-diagram) for visual representations of this architecture. 