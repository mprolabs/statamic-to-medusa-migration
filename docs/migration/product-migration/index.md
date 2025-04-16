---
layout: default
title: Product Migration
parent: Migration
has_children: true
nav_order: 5
---

# Product Migration

This section provides detailed documentation on migrating product data from Statamic with Simple Commerce to the Saleor e-commerce platform, with particular focus on preserving multi-region and multi-language product information.

## Overview

Product migration is one of the most critical and complex aspects of the overall migration process. It involves transferring product catalogs, variants, attributes, pricing, inventory, and media assets to Saleor while maintaining data integrity and ensuring proper multi-region and multi-language support.

## Migration Process

The product migration follows these key stages:

1. **Data Extraction**: Extracting product data from Statamic's collections and Simple Commerce
2. **Data Transformation**: Mapping and transforming product data to Saleor's data model
3. **Data Enrichment**: Adding additional information required by Saleor
4. **Multi-Region Configuration**: Setting up channel-specific product data
5. **Multi-Language Support**: Configuring product translations
6. **Data Validation**: Verifying the accuracy and completeness of migrated data
7. **Media Migration**: Transferring product images and other media assets

## Key Components

| Component | Description | Migration Complexity |
|-----------|-------------|---------------------|
| **Basic Product Data** | Name, description, slugs | Medium |
| **Product Variants** | SKUs, prices, attributes | High |
| **Product Attributes** | Size, color, material, etc. | High |
| **Product Categories** | Category hierarchy and assignments | Medium |
| **Product Collections** | Manual and dynamic collections | Medium |
| **Product Media** | Images, videos, 3D models | High |
| **Pricing Information** | Base prices, discounts, promotions | High |
| **Inventory Data** | Stock levels, warehouse assignments | Medium |
| **SEO Metadata** | Meta titles, descriptions, tags | Low |
| **Region-Specific Data** | Channel availability, regional pricing | Very High |
| **Translations** | Multilingual product information | Very High |

## Detailed Documentation

For specific aspects of the product migration process, refer to the following detailed guides:

- [Migration Scripts](migration-scripts.md) - Technical implementation details of the product migration scripts
- [Product Attribute Mapping](product-attribute-mapping.md) - Detailed mapping of product attributes between systems

## Multi-Region Considerations

The migration process accounts for different regional requirements:

- Products may have different availability in each region (NL, BE, DE)
- Pricing may vary by region (including currency differences)
- Tax configurations differ between regions
- Some products may be region-exclusive

## Multi-Language Considerations

Products in the legacy system may have content in multiple languages that need to be migrated:

- Product names and descriptions in EN, NL, DE, FR
- Language-specific SEO metadata
- Language-specific media (e.g., size charts)
- Attribute values in multiple languages

## Data Mapping Example

Below is a simplified example of how product data is mapped between systems:

```yaml
# Statamic/Simple Commerce Product
id: product-123
title: "Premium Cotton T-Shirt"
slug: premium-cotton-t-shirt
description: "High-quality cotton t-shirt, perfect for everyday wear."
price: 29.99
categories:
  - clothing
  - t-shirts
variants:
  - sku: TSHIRT-S-BLK
    title: "Small Black"
    price: 29.99
    attributes:
      size: Small
      color: Black
    stock: 25
  - sku: TSHIRT-M-BLK
    title: "Medium Black"
    price: 29.99
    attributes:
      size: Medium
      color: Black
    stock: 38
images:
  - path: products/tshirt-black-front.jpg
    alt: "Front view"
  - path: products/tshirt-black-back.jpg
    alt: "Back view"

# Mapped to Saleor:
## Product
- id: <generated>
- name: "Premium Cotton T-Shirt"
- slug: "premium-cotton-t-shirt"
- description: <converted-to-json-content>
- category: <mapped-category-id>
- metadata: {'legacy_id': 'product-123'}

## Product Type & Attributes
- name: "T-Shirt"
- attributes:
  - size (selectable: S, M, L, XL)
  - color (selectable: Black, White, Red, etc.)

## Variants
- each variant mapped with:
  - sku
  - attributes
  - price
  - stock information

## Channel Listings
- NL channel: price 29.99 EUR
- BE channel: price 29.99 EUR
- DE channel: price 29.99 EUR

## Translations
- name (NL): "Premium Katoenen T-Shirt"
- name (DE): "Premium Baumwoll-T-Shirt"
- description translations in all languages
```

## Validation Process

After migration, products undergo a thorough validation process:

1. **Count Verification**: Ensuring all products were migrated
2. **Data Accuracy**: Checking that key fields were transferred correctly
3. **Variant Validation**: Verifying all variants were created with correct attributes
4. **Pricing Verification**: Confirming prices are correct across all channels
5. **Media Validation**: Ensuring all images are properly linked
6. **Translation Verification**: Checking language-specific content
7. **Availability Testing**: Confirming products appear correctly in each region

## Migration Timeline

The product migration is scheduled to be executed according to the following timeline:

1. **Setup Phase (Week 1)**: Preparing migration scripts and environments
2. **Test Migration (Week 2)**: Running migration on a subset of products
3. **Full Migration (Week 3-4)**: Complete product catalog migration
4. **Validation (Week 5)**: Thorough testing and validation
5. **Fixes and Adjustments (Week 6)**: Addressing any issues identified

## Related Documentation

- [Data Mapping](../data-mapping.md) - General data mapping between systems
- [Content Migration](../content-migration.md) - Process for migrating related content
- [Multi-Region Implementation](/multi-region-language/multi-region-implementation/) - Details on multi-region support 