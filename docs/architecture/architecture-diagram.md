---
layout: default
title: Architecture Diagram
description: Visual representation of the Saleor migration project architecture
---

# Architecture Diagram

The following diagram illustrates the architecture of our Saleor-based e-commerce platform. This layered architecture follows Saleor best practices while incorporating our specific customizations for multi-region and multi-language support.

![Saleor Architecture Diagram](/assets/images/architecture-diagram.svg)
*Full architecture diagram showing the layered approach of our Saleor implementation*

## Architecture Layers

### Client Layer

The Client Layer consists of applications that interact with our commerce platform:

- **Storefront**: The customer-facing web application, built with Next.js for optimal performance and SEO
- **Admin Dashboard**: The admin interface for managing products, orders, and content, using Saleor's built-in Dashboard UI with custom extensions

### API Layer (GraphQL)

The API Layer serves as the entry point for all client requests:

- **GraphQL API**: Saleor's comprehensive GraphQL API organized by domain (products, orders, customers, etc.)
- **Session Management**: JWT-based authentication for maintaining state

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
- **Redis**: Used for caching and task queuing

### Content Management

Content management is handled directly within Saleor:

- **Saleor Content**: Built-in content management capabilities for product descriptions, marketing content, and media assets
- Provides multi-language content management through translations API

### Data Migration

The Data Migration component facilitates the transition from Statamic:

- **Migration Tools**: Custom utilities for extracting data from Statamic and importing into Saleor
- Handles mappings between different data models and structures

## Multi-Region and Multi-Language Support

Our architecture has been designed with multi-region and multi-language support as core principles:

1. **Routing Layer**: Routes requests to the appropriate region based on domain/subdomain
2. **Channel Configuration**: Region-specific settings using Saleor's Channel system for currencies, shipping, etc.
3. **Language Context**: Language information flows through all layers, from client to data store
4. **Content Translation**: Saleor manages translated content for all supported languages
5. **Regional Data**: PostgreSQL stores region-specific product information, pricing, and availability through Saleor's Channel system

## Communication Flow

1. Client applications make GraphQL requests to the Saleor API
2. API resolvers route requests to the appropriate Workflow
3. Workflows orchestrate operations using one or more Modules
4. Modules query/manipulate data in the Data Store
5. Data Migration tools interact with PostgreSQL during the migration process 