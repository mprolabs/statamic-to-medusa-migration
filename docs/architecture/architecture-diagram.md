---
layout: default
title: Architecture Diagram
description: Visual representation of the Medusa migration project architecture
---

# Architecture Diagram

The following diagram illustrates the architecture of our Medusa-based e-commerce platform. This layered architecture follows Medusa.js best practices while incorporating our specific customizations for multi-region and multi-language support.

![Medusa Architecture Diagram](/assets/images/architecture-diagram.svg)
*Full architecture diagram showing the layered approach of our Medusa implementation*

## Architecture Layers

### Client Layer

The Client Layer consists of applications that interact with our commerce platform:

- **Storefront**: The customer-facing web application, built with Next.js for optimal performance and SEO
- **Admin Dashboard**: The admin interface for managing products, orders, and content, using Medusa's built-in admin UI with custom extensions

### HTTP Layer (Express.js)

The HTTP Layer serves as the entry point for all client requests:

- **API Routes**: Express.js-based endpoints organized by domain (products, orders, customers, etc.)
- **Session Management**: Utilizes Redis for storing session data and maintaining state

### Workflow Layer

The Workflow Layer contains the business logic of the application:

- **Product Workflows**: Encapsulates product management operations 
- **Order Workflows**: Handles order creation, processing, and fulfillment
- **Customer Workflows**: Manages customer operations and profiles
- **Payment Workflows**: Orchestrates payment processing and verification

Workflows are responsible for:
- Implementing business rules and constraints
- Orchestrating operations across multiple modules
- Ensuring transactional integrity
- Handling compensating actions for failed operations

### Module Layer

The Module Layer provides domain-specific resource management:

- **Product Module**: Manages product catalog, variations, and metadata
- **Order Module**: Handles order creation and lifecycle
- **Customer Module**: Manages customer profiles and preferences
- **Payment Module**: Interfaces with payment providers
- **Inventory Module**: Tracks product availability and stock levels

Modules abstract the underlying data storage and provide:
- Data access operations
- Domain-specific validation
- Event triggers
- Internal business logic

### Data Store Layer

The Data Store Layer persists the application data:

- **PostgreSQL**: Primary data store for commerce data (products, orders, customers)
- **Redis**: Used for session management, caching, and pub/sub messaging

### Content Platform

The Content Platform manages content and media:

- **Strapi CMS**: Headless CMS for managing product descriptions, blog posts, marketing content, and media assets
- Provides multi-language content management capabilities

### Data Migration

The Data Migration component facilitates the transition from Statamic:

- **Migration Tools**: Custom utilities for extracting data from Statamic and importing into Medusa.js/Strapi
- Handles mappings between different data models and structures

## Multi-Region and Multi-Language Support

Our architecture has been designed with multi-region and multi-language support as core principles:

1. **Routing Layer**: Routes requests to the appropriate region based on domain/subdomain
2. **Region Configuration**: Region-specific settings for currencies, languages, shipping, etc.
3. **Language Context**: Language information flows through all layers, from client to data store
4. **Content Translation**: Strapi CMS manages translated content for all supported languages
5. **Regional Data**: PostgreSQL stores region-specific product information, pricing, and availability

## Communication Flow

1. Client applications make HTTP requests to the API Routes
2. API Routes route requests to the appropriate Workflow
3. Workflows orchestrate operations using one or more Modules
4. Modules query/manipulate data in the Data Store
5. API Routes may also interact directly with the Strapi CMS for content
6. Data Migration tools interact with both PostgreSQL and Strapi during the migration process 