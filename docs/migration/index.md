---
title: Migration
layout: default
has_children: true
nav_order: 4
permalink: /migration/
---

# Migration

This section contains documentation related to the migration from Statamic CMS with Simple Commerce to Saleor.

## Overview

Our migration project involves several key components:

1. **Statamic to Saleor Platform Migration**: Moving from Statamic CMS with Simple Commerce to the Saleor headless e-commerce platform
2. **Multi-Region Support**: Implementing region-specific configurations for NL, BE, and DE using Saleor's Channel system
3. **Multi-Language Support**: Supporting content in Dutch, German, English, and French using Saleor's translation capabilities
4. **Nimara Framework Adoption**: Migrating our custom Next.js storefront to the Nimara e-commerce framework

## Key Migration Guides

- [Data Migration Guide](data-migration.md) - Detailed process for migrating data from Statamic to Saleor
- [Nimara Migration Guide](nimara-migration-guide.md) - Guide for migrating our custom storefront to the Nimara framework
- [Multi-Region Implementation](/multi-region-language/multi-region-implementation/) - How to implement multi-region support using Saleor's Channel system
- [Multi-Language Implementation](/multi-region-language/multi-language-implementation/) - Approach for implementing multi-language support

## Migration Timeline

| Phase | Description | Status |
|-------|-------------|--------|
| Proof of Concept | Validate technical approach and architecture | Completed |
| Development Environment Setup | Configure Saleor and Next.js environments | Completed |
| Data Model Design | Define Saleor data models and migration mappings | Completed |
| Storefront Development | Build initial custom storefront | Completed |
| Nimara Framework Migration | Move to Nimara e-commerce framework | In Progress |
| Data Migration | Execute data migration | Pending |
| Testing & Optimization | Test and refine implementation | Pending |
| Deployment & Launch | Deploy to production | Pending |

## Recent Updates

- **2023-05-15**: Decision to adopt Nimara e-commerce framework
- **2023-05-01**: Completed initial custom storefront implementation
- **2023-04-15**: Finalized multi-region and multi-language implementation approach
- **2023-04-01**: Completed architecture design for Saleor migration

## Related Resources

- [Multi-Region/Language Documentation](/multi-region-language/) - Comprehensive guide to multi-region and multi-language support
- [Architecture Documentation](/architecture/) - Technical architecture diagrams and documentation

## Migration Documents

- [API Specifications](api-specifications.md) - Detailed API contracts and endpoint specifications
- [Authentication & Security](authentication-security.md) - Authentication mechanisms and security considerations
- [Data Migration](data-migration.md) - Process for migrating data to Saleor
- [Content Migration](content-migration.md) - Strategy for migrating content from Statamic
- [Data Mapping](data-mapping.md) - Detailed mapping between Statamic and Saleor data models
- [Migration Strategy](migration-strategy.md) - Comprehensive approach for the migration process
- [User Migration](user-migration.md) - Process for migrating user accounts and authentication
- [OpenAPI Documentation](openapi-documentation.md) - REST API specifications and endpoint documentation

## Product Migration

The product migration is a critical component of the overall migration strategy. These documents provide detailed guidance on product data migration:

- [Product Migration Overview](product-migration/index.md) - Overview of the product migration process
- [Migration Scripts](product-migration/migration-scripts.md) - Technical implementation of product migration scripts
- [Product Attribute Mapping](product-migration/product-attribute-mapping.md) - Detailed mapping of product attributes between systems

## Migration Process Overview

The migration from Statamic to Saleor involves several key phases:

1. **Analysis and Planning**: Understanding the current Statamic implementation and planning the migration strategy.
2. **Data Mapping**: Creating mappings between Statamic data structures and Saleor models.
3. **API Integration**: Setting up the necessary APIs for data transfer.
4. **Content Migration**: Moving content from Statamic to Saleor.
5. **User Migration**: Transferring user accounts and authentication.
6. **Testing and Validation**: Ensuring the migrated data is accurate and functions correctly.
7. **Deployment**: Launching the new Saleor-based system.

Each aspect of the migration process is detailed in the associated documentation pages.

# Migration Process

This section outlines the comprehensive migration strategy from Statamic CMS with Simple Commerce to Saleor, with a focus on preserving and enhancing multi-region and multi-language capabilities.

## Migration Overview

The migration follows these key phases:

1. **Assessment & Planning**
2. **Environment Setup**
3. **Data Modeling & Mapping**
4. **Data Migration**
5. **Frontend Development**
6. **Testing & Validation**
7. **Deployment & Go-Live**

## Current System Analysis

The current Statamic-based system includes:

- **CMS**: Statamic as the content management system
- **E-commerce**: Simple Commerce for product management and checkout
- **Frontend**: Laravel Blade templates with Vue.js components
- **Database**: MySQL database for data storage
- **Multi-site**: Limited multi-site capabilities through Statamic's multi-site feature
- **Languages**: Basic multi-language support

## Target System Architecture

The target Saleor-based system includes:

- **E-commerce**: Saleor Core with Channels feature for multi-region support
- **Frontend**: Next.js-based storefront with advanced routing for multiple domains
- **APIs**: GraphQL API for communication between frontend and backend
- **Database**: PostgreSQL for data storage
- **Multi-region**: Comprehensive multi-region support via Saleor Channels
- **Multi-language**: Advanced language capabilities throughout the platform

## Migration Methodology

### 1. Data Extraction

The first step is to extract all relevant data from the current Statamic system:

- Product catalog with all variants and attributes
- Categories and collections
- Customer data and order history
- CMS content including pages, blog posts, and media
- Site configuration and settings
- URL structures for SEO preservation

Data extraction tools include:

- Custom PHP scripts to access Statamic's data structures
- Database exports for structured data
- API calls for programmatically accessible data
- File system operations for assets and media

### 2. Data Transformation

The extracted data needs to be transformed to match Saleor's data models:

- Mapping Statamic product structure to Saleor's product model
- Converting content to appropriate formats for the new system
- Transforming customer and order data to match Saleor's schemas
- Preparing data with appropriate language variants
- Adding channel-specific data for multi-region support

### 3. Data Loading

Processed data is loaded into the Saleor system through:

- GraphQL mutations for structured data
- Saleor's import/export APIs for bulk operations
- Custom import scripts for complex data structures
- Media asset import to appropriate storage

### 4. Multi-Region Configuration

Special attention is given to setting up the multi-region capabilities:

- Creating appropriate Channels in Saleor (Netherlands, Belgium, Germany)
- Configuring region-specific settings (currencies, taxes, shipping)
- Setting up channel-specific product visibility and pricing
- Establishing domain-specific routing

### 5. Multi-Language Implementation

Language support is implemented through:

- Product translations in Saleor
- Content translations for all static content
- Language-specific SEO metadata
- Frontend components for language switching
- Language detection and persistence mechanisms

## Migration Challenges and Solutions

### Challenge: Data Model Differences

**Solution**: Comprehensive mapping between Statamic and Saleor data models, with transformation scripts to handle structural differences.

### Challenge: URL Structure Preservation

**Solution**: Custom routing implementation in Next.js to preserve existing URL structures for SEO, with appropriate redirects for changed URLs.

### Challenge: Multi-Region Data

**Solution**: Channel-specific data imports with region context preserved throughout the migration process.

### Challenge: User Accounts and Orders

**Solution**: Secure migration of user data with appropriate hashing, preserving order history with region context.

### Challenge: Content Relationships

**Solution**: Relationship mapping to preserve connections between content types, products, and other entities.

## Migration Timeline

The migration is scheduled to proceed as follows:

1. **Assessment Phase**: 2 weeks
2. **Environment Setup**: 1 week
3. **Data Modeling & Mapping**: 3 weeks
4. **Migration Script Development**: 4 weeks
5. **Test Migration**: 2 weeks
6. **Frontend Development**: 6 weeks (parallel with migration development)
7. **Integration Testing**: 3 weeks
8. **Performance Optimization**: 2 weeks
9. **User Acceptance Testing**: 2 weeks
10. **Go-Live Preparation**: 1 week
11. **Deployment and Go-Live**: 1 week

## Risk Mitigation

To minimize risks during the migration:

- Development and testing occur in isolated environments
- Multiple test migrations are performed before the final migration
- Comprehensive backup strategy for all source data
- Detailed rollback plan in case of unexpected issues
- Thorough testing across all regions and languages
- Phased go-live approach if necessary

## Additional Documentation

For more detailed documentation on specific aspects of the migration process, refer to:

- [Data Migration Guide](data-migration.md) - Detailed data mapping and migration process
- [Nimara Migration Guide](nimara-migration-guide.md) - Framework migration details
- [API Specifications](api-specifications.md) - Technical API details
- [Content Migration](content-migration.md) - Content migration strategy 