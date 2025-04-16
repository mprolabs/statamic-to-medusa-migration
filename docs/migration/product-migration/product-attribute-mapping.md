---
title: Product Attribute Mapping
parent: Product Migration
nav_order: 1
has_toc: true
multilang_export: true
permalink: /migration/product-migration/product-attribute-mapping/
---

# Product Attribute Mapping

This document provides a detailed mapping between Statamic Simple Commerce product attributes and their Saleor equivalents. This mapping serves as a reference for the migration scripts to properly transform product data.

## Core Product Properties

| Simple Commerce Property | Saleor Property | Data Type | Transformation Notes |
|--------------------------|-----------------|-----------|---------------------|
| `title` | `name` | String | Direct mapping, translatable |
| `slug` | `slug` | String | Direct mapping, ensure uniqueness |
| `description` | `description` (JSON) | Rich text | Convert Statamic Bard field to Saleor's JSON rich text format |
| `price` | `variants[].price` | Decimal | Map to variant pricing in appropriate channel |
| `tax_rate` | `taxClass` | Object | Map to appropriate Saleor tax class |
| `product_type` | `productType` | Object | Map to Saleor product type system |
| `seo_title` | `seoTitle` | String | Direct mapping, translatable |
| `seo_description` | `seoDescription` | String | Direct mapping, translatable |
| `published` | `isPublished` | Boolean | Direct mapping |
| `featured` | Custom attribute | Boolean | Create custom attribute in Saleor |

## Variant Properties

| Simple Commerce Property | Saleor Property | Data Type | Transformation Notes |
|--------------------------|-----------------|-----------|---------------------|
| `variant_title` | `variants[].name` | String | Direct mapping, translatable |
| `sku` | `variants[].sku` | String | Direct mapping |
| `barcode` | `variants[].barcode` | String | Direct mapping |
| `price` | `variants[].price` | Decimal | Channel-specific pricing |
| `stock` | `variants[].stocks` | Integer | Map to warehouse-specific stocks |
| `weight` | `variants[].weight` | Decimal | Convert to Saleor's weight unit (g) |
| `dimensions` | `variants[].height/width/depth` | Decimal | Split into individual dimensions |

## Custom Attributes Mapping

| Simple Commerce Attribute | Saleor Implementation | Data Type | Transformation Notes |
|---------------------------|----------------------|-----------|---------------------|
| `color` | ProductAttribute | String | Create as product-type attribute |
| `size` | ProductAttribute | String | Create as product-type attribute, used for variants |
| `material` | ProductAttribute | String | Create as product-type attribute |
| `brand` | ProductAttribute | String | Create as product-type attribute |
| `features` | ProductAttribute | List of strings | Convert comma-separated values to list |
| `specifications` | ProductAttribute | Rich text | Convert to Saleor's JSON rich text format |
| `related_products` | Product.relatedProducts | List of references | Map product references |
| `custom_tags` | ProductAttribute | List of strings | Convert to Saleor product attribute |

## Multi-Language Fields

The following fields need to be migrated with translations:

| Field | Translation Approach |
|-------|---------------------|
| `name` | Use Saleor's translation API for each language |
| `description` | Translate rich text content per language |
| `seoTitle` | Migrate language-specific SEO titles |
| `seoDescription` | Migrate language-specific SEO descriptions |
| `variants[].name` | Translate variant names for each language |
| Custom attribute values | Translate attribute values where appropriate |

## Multi-Region Considerations

For channel-specific data:

| Data Type | Channel Handling |
|-----------|------------------|
| Pricing | Set different prices per channel (NL, BE, DE) |
| Availability | Configure channel availability using ProductChannelListing |
| Currency | Set appropriate currency per channel (EUR) |
| Stock | Configure warehouse stock levels per region |

## Product Type Mapping

| Simple Commerce Product Category | Saleor Product Type | Attributes to Include |
|--------------------------|---------------------|------------------------|
| Clothing | Clothing | size, color, material, brand, care_instructions |
| Electronics | Electronics | specifications, brand, warranty, power_requirements |
| Books | Books | author, publisher, isbn, pages, language |
| Home goods | HomeGoods | dimensions, material, color, brand, care_instructions |
| Food items | FoodItems | ingredients, allergens, nutrition_facts, storage_instructions |

## Media Asset Mapping

| Simple Commerce Media | Saleor Media | Transformation Notes |
|----------------------|--------------|---------------------|
| Main product image | First product media | Set as primary thumbnail |
| Gallery images | Additional product media | Maintain order |
| Variant-specific images | Variant-specific media | Associate with appropriate variants |

## Implementation Notes

1. **Prerequisites:**
   - Create all necessary product types in Saleor before migration
   - Set up attributes for each product type
   - Configure channels for each region

2. **Migration Order:**
   - First create product types and attributes
   - Then create base products
   - Then add variants
   - Finally, associate media and set translations

3. **Data Validation:**
   - Ensure SKUs are unique across all products
   - Validate that required fields are not empty
   - Check that prices are valid decimal values
   - Verify stock levels are non-negative integers

This mapping document will be used by the ETL scripts to ensure proper transformation of product data during migration. 