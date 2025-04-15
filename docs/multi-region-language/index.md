---
layout: default
title: Multi-Region & Multi-Language Support
description: Implementation details for multi-region and multi-language capabilities using Saleor
---

# Multi-Region and Multi-Language Implementation

This section provides comprehensive documentation on how multi-region and multi-language capabilities are implemented in the Saleor-based e-commerce platform.

## Architecture Diagrams

For a visual representation of the multi-region and multi-language architecture, please refer to the following diagrams:

- [Multi-Region Architecture Diagram]({{ site.baseurl }}/architecture/diagrams/#multi-region-architecture)
- [Multi-Language Architecture Diagram]({{ site.baseurl }}/architecture/diagrams/#multi-language-architecture)

These diagrams illustrate the relationships between different components and how data flows through the system.

## Overview

Our implementation supports:

- **3 Distinct Regions/Domains**: 
  - Netherlands (`domain-nl.com`)
  - Belgium (`domain-be.com`)
  - Germany (`domain-de.com`)
- **2 Primary Languages**:
  - Dutch
  - German
  - (French is also supported in the Belgium region)

## Key Architecture Components

### 1. Region Implementation via Saleor Channels

Saleor's Channel feature serves as the foundation for our multi-region implementation:

```
Saleor
├── Netherlands Channel
│   ├── Currency: EUR
│   ├── Tax Configuration: Dutch VAT rules
│   ├── Shipping Methods: NL-specific carriers
│   └── Payment Providers: iDeal, Credit Cards
│
├── Belgium Channel
│   ├── Currency: EUR
│   ├── Tax Configuration: Belgian VAT rules
│   ├── Shipping Methods: BE-specific carriers
│   └── Payment Providers: Bancontact, Credit Cards
│
└── Germany Channel
    ├── Currency: EUR
    ├── Tax Configuration: German VAT rules
    ├── Shipping Methods: DE-specific carriers
    └── Payment Providers: SEPA, Credit Cards
```

### 2. Content Translation System

Product information and content are managed with full multi-language support:

- **Product Translations**: Stored directly in Saleor with language variants
- **Content Management**: Static content, blog posts, and marketing materials translated for each supported language
- **SEO Metadata**: Language-specific SEO information for optimal search engine visibility

### 3. Domain-Specific Routing

Each region is served through its own dedicated domain with appropriate routing:

```
domain-nl.com    → Netherlands Channel (Dutch primary)
domain-be.com    → Belgium Channel (Dutch/French)
domain-de.com    → Germany Channel (German primary)
```

### 4. User Experience Considerations

- **Language Detection**: Automatic detection based on browser settings
- **Language Persistence**: User language preference is remembered
- **Region Detection**: Geo-IP based routing with user confirmation
- **Cross-Region Experience**: Consistent user experience across regions

## Technical Implementation

### Channel Configuration in Saleor

Each Channel in Saleor is configured with:

1. **Channel-specific pricing**: Prices can be adjusted per region
2. **Product visibility**: Products can be made available or unavailable in specific regions
3. **Fulfillment settings**: Different shipping options and warehouses per region
4. **Tax settings**: Region-appropriate tax configurations

### Frontend Implementation with Next.js

The Next.js frontend handles:

1. **Domain routing**: Proper routing to the appropriate language and region
2. **Language switching**: UI components to change language preference
3. **Region-aware API calls**: Including channel information in all Saleor API requests
4. **Localized components**: Components that adapt to the current language context

### Language Implementation Details

Our language implementation uses:

1. **Next.js i18n**: For frontend translation and URL structure
2. **Saleor Translation API**: For storing product and content translations
3. **Language Context**: A wrapper that ensures language preferences are applied consistently
4. **Translation Management**: A system for managing and updating translations across all regions

### Database Structure for Multi-Language

The underlying database structure supports:

1. **Translated fields**: Core content fields have language variants
2. **Region-specific data**: Pricing, availability, and configurations per region
3. **Shared core data**: Product IDs and structural information shared across regions

## Migration Considerations

Migrating from Statamic to this multi-region, multi-language Saleor implementation involves:

1. **Data mapping**: Mapping Statamic content to the appropriate regions and languages
2. **URL structure preservation**: Maintaining SEO value across the migration
3. **Region-specific data migration**: Ensuring pricing and product data is migrated with regional context
4. **Testing across regions**: Comprehensive testing in all region/language combinations

## Best Practices

When working with the multi-region and multi-language capabilities:

1. **Always include channel context** in API calls to Saleor
2. **Test in all language combinations** when making changes
3. **Consider regional differences** in business rules and user expectations
4. **Maintain translations** for all content, including error messages and notifications
5. **Preserve URL structures** for SEO across languages and regions

## Detailed Documentation

For more detailed information on specific aspects of the multi-region and multi-language implementation, see:

- [Region Configuration](region-configuration.md)
- [Language Implementation](language-implementation.md)
- [Domain-Specific Setup](domain-setup.md)
- [SEO Considerations](seo.md) 