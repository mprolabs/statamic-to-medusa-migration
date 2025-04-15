---
layout: default
title: Architecture Diagram
description: Visual representation of the Saleor migration project architecture
parent: Architecture
nav_order: 2
permalink: /architecture/architecture-diagram/
---

# Architecture Diagram

The following diagrams illustrate the architecture of our Saleor-based e-commerce platform. This layered architecture follows Saleor best practices while incorporating our specific customizations for multi-region and multi-language support.

## Main Architecture

![Saleor Architecture Diagram]({{ site.baseurl }}/assets/images/architecture-diagram.svg)
*Full architecture diagram showing the layered approach of our Saleor implementation*

## Multi-Region Architecture

![Saleor Multi-Region Architecture]({{ site.baseurl }}/assets/images/multi-region-diagram.svg)
*Detailed view of the multi-region implementation using Saleor Channels*

## Multi-Language Architecture

![Saleor Multi-Language Architecture]({{ site.baseurl }}/assets/images/multi-language-diagram.svg)
*Detailed view of the multi-language implementation with Next.js i18n integration*

## Architecture Layers

### Client Layer

The Client Layer consists of applications that interact with our commerce platform:

- **Storefront**: The customer-facing web application, built with Next.js for optimal performance and SEO
- **Admin Dashboard**: The admin interface for managing products, orders, and content, using Saleor's built-in Dashboard UI with custom extensions

### API Layer (GraphQL)

The API Layer serves as the entry point for all client requests:

- **GraphQL API**: Saleor's comprehensive GraphQL API organized by domain (products, orders, customers, etc.)
- **Session Management**: JWT-based authentication for maintaining state
- **Channel Context**: Provides region-specific context for all operations
- **Language Context**: Ensures proper language is applied throughout the request lifecycle

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
- **Channel Management**: Implements multi-region support through Saleor's Channel system
- **Translation Support**: Handles multi-language content through Saleor's translation API

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

1. **Domain Routing**: Routes requests to the appropriate region based on domain/subdomain (nl.domain.com, be.domain.com)
2. **Channel Configuration**: Region-specific settings using Saleor's Channel system for currencies, shipping, etc.
3. **Language Detection**: Identifies user language preference from URL, cookies, or browser settings
4. **Next.js i18n Integration**: Provides frontend translation capabilities and SEO-friendly URLs
5. **Language Context**: Language information flows through all layers, from client to data store
6. **Content Translation**: Saleor manages translated content for all supported languages
7. **Regional Data**: PostgreSQL stores region-specific product information, pricing, and availability through Saleor's Channel system

## Communication Flow

1. Client applications make GraphQL requests to the Saleor API
2. API resolvers route requests to the appropriate Workflow
3. Workflows orchestrate operations using one or more Modules
4. Modules query/manipulate data in the Data Store
5. Data Migration tools interact with PostgreSQL during the migration process 